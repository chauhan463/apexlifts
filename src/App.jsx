import { useState }    from "react";
import Header          from "./components/Header";
import Footer          from "./components/Footer";
import ProgressBar     from "./components/ProgressBar";
import Intro           from "./components/Intro";
import Step1Body       from "./components/steps/Step1Body";
import Step2Lifestyle  from "./components/steps/Step2Lifestyle";
import Step3Goal       from "./components/steps/Step3Goal";
import Results         from "./components/results/Results";

import { calculateAll, calcMacros } from "./utils/calculations";

import "./styles/global.css";
import styles from "./App.module.css";

const INITIAL_FORM = {
  name: "", age: "", gender: "Male", bodyFat: "",
  heightVal: "", heightUnit: "cm",
  weightVal: "", weightUnit: "kg",
  job: "", jobMultiplier: null,
  trainingFreq: "", trainingBonus: 0,
  steps: "", stepsBonus: 0,
  goal: "",
  cutDuration: undefined,
  weightLost: "",
};

export default function App() {
  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const progress = step === 0 ? 0 : step >= 4 ? 100 : (step / 3) * 100;

  const handleCalculate = () => {
    setError("");
    setLoading(true);
    try {
      const calc = calculateAll(form);
      setResults(calc);
      setStep(4);
    } catch (e) {
      setError("Something went wrong. Please check your inputs.");
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
    setStep(1);
    setResults(null);
    setError("");
  };

  return (
    <div className={styles.app}>
      <Header />
      <ProgressBar value={progress} />

      <main className={styles.main}>
        {step === 0 && <Intro onStart={() => setStep(1)} />}

        {step === 1 && (
          <Step1Body form={form} onChange={updateForm} onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <Step2Lifestyle
            form={form} onChange={updateForm}
            onNext={() => setStep(3)} onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Goal
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