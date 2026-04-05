import { JOBS, TRAINING_FREQ, STEPS } from "../../constants";
import styles from "./Steps.module.css";

const Section = ({ label, items, selected, onSelect }) => (
  <div className="field" style={{ marginTop: 20 }}>
    <label>{label}</label>
    <div className="pills">
      {items.map((item) => (
        <div
          key={item.label}
          className={`pill${selected === item.label ? " active" : ""}`}
          onClick={() => onSelect(item)}
        >
          {item.label}
          {item.hint && <span className={styles.pillHint}>{item.hint}</span>}
        </div>
      ))}
    </div>
  </div>
);

export default function StepLifestyle({ form, onChange, onSubmit, onBack, loading, error }) {
  const canProceed = form.job && form.trainingFreq && form.steps;

  const handleJob      = (item) => { onChange("job", item.label); onChange("jobMultiplier", item.multiplier); };
  const handleTraining = (item) => { onChange("trainingFreq", item.label); onChange("trainingBonus", item.bonus); };
  const handleSteps    = (item) => { onChange("steps", item.label); onChange("stepsBonus", item.bonus); };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Step 3 of 3 — Your Lifestyle</div>
        <h2 className={styles.title}>How do you move?</h2>
        <p className={styles.sub}>
          Job, training, and steps are calculated separately — so your desk job doesn't cancel out your 5× training week.
        </p>
      </div>

      <div className="card">
        <Section
          label="TYPE OF JOB"
          items={JOBS}
          selected={form.job}
          onSelect={handleJob}
        />
        <Section
          label="TRAINING FREQUENCY"
          items={TRAINING_FREQ}
          selected={form.trainingFreq}
          onSelect={handleTraining}
        />
        <Section
          label="DAILY STEPS"
          items={STEPS}
          selected={form.steps}
          onSelect={handleSteps}
        />

        {form.jobMultiplier && form.trainingBonus !== undefined && form.stepsBonus !== undefined && (
          <div className={styles.tdeePreview}>
            <span className={styles.tdeeLabel}>Activity breakdown</span>
            <div className={styles.tdeeRows}>
              <div className={styles.tdeeRow}>
                <span>Job / daily NEAT</span>
                <span>× {form.jobMultiplier}</span>
              </div>
              <div className={styles.tdeeRow}>
                <span>Training</span>
                <span>+{form.trainingBonus} kcal</span>
              </div>
              <div className={styles.tdeeRow}>
                <span>Steps / movement</span>
                <span>+{form.stepsBonus} kcal</span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        <button className="btn btn-primary" disabled={!canProceed || loading} onClick={onSubmit}>
          {loading ? "Calculating…" : "Get my numbers →"}
        </button>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </>
  );
}
