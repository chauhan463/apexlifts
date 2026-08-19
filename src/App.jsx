import { useState, useEffect } from "react";
import Header          from "./components/Header";
import Footer          from "./components/Footer";
import ProgressBar     from "./components/ProgressBar";
import Intro           from "./components/Intro";
import Dashboard       from "./components/Dashboard";
import WorkoutLog      from "./components/WorkoutLog";
import StepGoal        from "./components/steps/Step3Goal";
import StepBody        from "./components/steps/Step1Body";
import StepLifestyle   from "./components/steps/Step2Lifestyle";
import Results         from "./components/results/Results";

import { calculateAll, calcMacros } from "./utils/calculations";

import "./styles/global.css";
import styles from "./App.module.css";

const SESSION_KEY = "apexlifts_session";
const PROFILE_KEY = "apexlifts_profile"; // the last completed blueprint — lets returning users land on a dashboard instead of redoing the wizard

const INITIAL_FORM = {
  name: "", age: "", gender: "Male", bodyFat: "",
  heightVal: "", heightUnit: "cm",
  weightVal: "", weightUnit: "kg",
  // Smart defaults — most common answers pre-selected
  job: "Office / Remote",      jobMultiplier: 1.2,
  trainingFreq: "3–4× / week", trainingBonus: 200,
  steps: "7,500–10,000",       stepsBonus: 150,
  goal: "",
  cutDuration: undefined,
  weightLost: "",
};

const STEP_NAMES = { 1: "Your Goal", 2: "Your Body", 3: "Your Lifestyle" };

export default function App() {
  const [step,         setStep]         = useState(0);
  const [form,         setForm]         = useState(INITIAL_FORM);
  const [results,      setResults]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  // Both read synchronously on first render (not via useEffect) — otherwise there's
  // a one-frame flash of Intro before the dashboard swaps in on every reopen.
  const [savedSession, setSavedSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.step >= 1 && session?.step <= 3 && session?.form) return session;
      }
    } catch { /* storage unavailable */ }
    return null;
  });
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [resultsTab, setResultsTab] = useState(undefined); // deep-link into a Results tab from the dashboard

  // Persist session whenever form or step changes (only during active steps)
  useEffect(() => {
    if (step < 1 || step > 3) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ form, step }));
    } catch { /* storage unavailable */ }
  }, [form, step]);

  // Persist the profile whenever it changes (first calculation, or a later recalibration)
  useEffect(() => {
    if (!profile) return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch { /* storage unavailable */ }
  }, [profile]);

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const progress = step === 0 ? 0 : step >= 4 ? 100 : (step / 3) * 100;

  const handleCalculate = () => {
    setError("");
    setLoading(true);
    // Small deliberate delay — the calc is instant, but a jump-cut to results
    // feels broken; this gives the spinner time to register as real work.
    setTimeout(() => {
      try {
        const calc = calculateAll(form);
        setResults(calc);
        setProfile({ form, results: calc, savedAt: Date.now() });
        localStorage.removeItem(SESSION_KEY);
        setStep(4);
      } catch {
        setError("Something went wrong — please check your inputs.");
      }
      setLoading(false);
    }, 500);
  };

  const handleApplyRecalibration = (realTDEE, adjustedTarget) => {
    setResults((prev) => {
      const updated = {
        ...prev,
        tdee: realTDEE,
        targetCals: adjustedTarget,
        ...calcMacros(adjustedTarget, prev.wKg, form.goal),
      };
      // Keep the persisted profile (and therefore the dashboard) in sync with the recalibration
      setProfile((p) => (p ? { ...p, results: updated } : p));
      return updated;
    });
  };

  const handleRestart = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setResults(null);
    setProfile(null);
    setError("");
    setStep(1);
  };

  // From the dashboard: jump straight to Results using the saved profile,
  // optionally deep-linking into a specific tab (e.g. "Training" to build a split).
  const handleViewBlueprint = (tab) => {
    if (!profile) return;
    setForm(profile.form);
    setResults(profile.results);
    setResultsTab(tab);
    setStep(4);
  };

  // From Results back to the dashboard — the profile is already persisted, so this is a pure nav action
  const handleBackToDashboard = () => setStep(0);

  // From the dashboard into the workout logger (step 5) — its own self-contained screen
  const handleLogWorkout = () => setStep(5);

  const handleContinueSaved = () => {
    setForm(savedSession.form);
    setStep(savedSession.step);
    setSavedSession(null);
  };

  const handleStartFresh = () => {
    setSavedSession(null);
    localStorage.removeItem(SESSION_KEY);
    setStep(1);
  };

  return (
    <div className={styles.app}>
      <Header />
      <ProgressBar value={progress} step={step} stepNames={STEP_NAMES} />

      <main className={styles.main}>
        {step === 0 && (
          profile ? (
            <Dashboard
              profile={profile}
              onViewBlueprint={handleViewBlueprint}
              onStartOver={handleRestart}
              onLogWorkout={handleLogWorkout}
            />
          ) : (
            <Intro
              onStart={() => setStep(1)}
              savedSession={savedSession}
              stepNames={STEP_NAMES}
              onContinue={handleContinueSaved}
              onStartFresh={handleStartFresh}
            />
          )
        )}

        {step === 1 && (
          <StepGoal
            form={form} onChange={updateForm}
            onNext={() => setStep(2)} onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepBody
            form={form} onChange={updateForm}
            onNext={() => setStep(3)} onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepLifestyle
            form={form} onChange={updateForm}
            onSubmit={handleCalculate} onBack={() => setStep(2)}
            loading={loading} error={error}
          />
        )}

        {step === 4 && results && (
          <Results
            form={form}
            results={results}
            onRestart={handleRestart}
            onApplyRecalibration={handleApplyRecalibration}
            onBackToDashboard={handleBackToDashboard}
            initialTab={resultsTab}
          />
        )}

        {step === 5 && profile && (
          <WorkoutLog profile={profile} onBack={handleBackToDashboard} />
        )}
      </main>

      <Footer />
    </div>
  );
}
