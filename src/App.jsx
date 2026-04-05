import { useState, useEffect } from "react";
import Header          from "./components/Header";
import Footer          from "./components/Footer";
import ProgressBar     from "./components/ProgressBar";
import Intro           from "./components/Intro";
import StepGoal        from "./components/steps/Step3Goal";
import StepBody        from "./components/steps/Step1Body";
import StepLifestyle   from "./components/steps/Step2Lifestyle";
import Results         from "./components/results/Results";

import { calculateAll, calcMacros } from "./utils/calculations";

import "./styles/global.css";
import styles from "./App.module.css";

const SESSION_KEY = "apexlifts_session";

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
  const [savedSession, setSavedSession] = useState(null);

  // Load saved session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.step >= 1 && session?.step <= 3 && session?.form) {
          setSavedSession(session);
        }
      }
    } catch { /* storage unavailable */ }
  }, []);

  // Persist session whenever form or step changes (only during active steps)
  useEffect(() => {
    if (step < 1 || step > 3) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ form, step }));
    } catch { /* storage unavailable */ }
  }, [form, step]);

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const progress = step === 0 ? 0 : step >= 4 ? 100 : (step / 3) * 100;

  const handleCalculate = () => {
    setError("");
    setLoading(true);
    try {
      const calc = calculateAll(form);
      setResults(calc);
      localStorage.removeItem(SESSION_KEY);
      setStep(4);
    } catch {
      setError("Something went wrong — please check your inputs.");
    }
    setLoading(false);
  };

  const handleApplyRecalibration = (realTDEE, adjustedTarget) => {
    setResults((prev) => ({
      ...prev,
      tdee: realTDEE,
      targetCals: adjustedTarget,
      ...calcMacros(adjustedTarget, prev.wKg, form.goal),
    }));
  };

  const handleRestart = () => {
    localStorage.removeItem(SESSION_KEY);
    setResults(null);
    setError("");
    setStep(1);
  };

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
      <ProgressBar value={progress} />

      <main className={styles.main}>
        {step === 0 && (
          <Intro
            onStart={() => setStep(1)}
            savedSession={savedSession}
            stepNames={STEP_NAMES}
            onContinue={handleContinueSaved}
            onStartFresh={handleStartFresh}
          />
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
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
