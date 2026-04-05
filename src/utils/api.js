// ─── Gemini API ───────────────────────────────────────────────────────────────
// Replace with your key from https://aistudio.google.com
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";


// Models tried in order — if one hits quota, falls back to the next
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

const geminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Generic Gemini call with automatic model fallback on quota errors
 */
export const callAI = async (prompt, system) => {
  let lastError;

  for (const model of MODELS) {
    try {
      const response = await fetch(geminiUrl(model), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.82, maxOutputTokens: 900 },
        }),
      });

      // On quota (429), model not found (400/404) — try next model
      if (response.status === 429 || response.status === 404 || response.status === 400) {
        const err = await response.json().catch(() => ({}));
        lastError = new Error(err?.error?.message || `Model ${model} unavailable`);
        continue;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `AI error ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

    } catch (e) {
      // Network error — don't bother trying other models
      if (e.message.includes("AI error") || e.message.includes("fetch")) throw e;
      lastError = e;
    }
  }

  throw lastError
    ? new Error("AI coach is busy right now — please try again in a moment.")
    : new Error("Something went wrong. Check your API key in the .env file.");
};

// ─── Prompt builders ──────────────────────────────────────────────────────────

export const buildInsightPrompt = (form, results) => ({
  prompt: `Name: ${form.name || "this athlete"}. Age: ${results.age}. Gender: ${form.gender}. Height: ${results.hCm.toFixed(0)}cm. Weight: ${results.wKg.toFixed(1)}kg. Job: ${form.job}. Lifestyle: ${form.lifestyle}. Goal: ${form.goal}. TDEE: ${results.tdee} kcal. Target: ${results.targetCals} kcal. Protein: ${results.proteinG}g, Carbs: ${results.carbG}g, Fat: ${results.fatG}g.`,
  system: `You are the AI coach for Apex.Lifts — a platform that blends real science with genuine motivation. Write a personal 3–4 sentence message directly to this person (use their name if given). Acknowledge their lifestyle and job honestly. Explain in plain, confident language why their numbers are set this way — grounded in science but human. End with one sharp, specific action they can take today for their goal. No bullet points. No generic phrases. Sound like a coach who actually read their profile.`,
});

export const buildTrainingPrompt = (form, results, selectedDays) => ({
  prompt: `Training days: ${selectedDays.join(", ")} (${selectedDays.length} days/week). Goal: ${form.goal}. Lifestyle: ${form.lifestyle}. Weight: ${results.wKg.toFixed(1)}kg.`,
  system: `You are a certified S&C coach at Apex.Lifts. Build a practical weekly training plan for the exact days listed. Each training day: name the session (e.g. "Push — Chest & Shoulders"), list 4–5 exercises with sets×reps. Rest days: "Rest / Active Recovery" + one brief recovery tip. Direct, structured, motivating. No filler.`,
});

export const buildDietReviewPrompt = (form, results, currentCals, currentProtein) => ({
  prompt: `Goal: ${form.goal}. Target: ${results.targetCals} kcal/day, ${results.proteinG}g protein. Current: ${currentCals} kcal/day, protein: ${currentProtein || "unknown"}g/day.`,
  system: `You are a nutrition coach at Apex.Lifts. In 3–4 sentences: compare current vs target intake, name the single most impactful fix, give one concrete action for today. Direct, specific, no generic advice.`,
});