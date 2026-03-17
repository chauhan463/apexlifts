import styles from "./Steps.module.css";

const validate = (form) => {
  const errors = {};
  const age = parseInt(form.age);
  if (!form.age || isNaN(age) || age < 13 || age > 99)
    errors.age = "Enter an age between 13 and 99";

  const weight = parseFloat(form.weightVal);
  if (!form.weightVal || isNaN(weight) || weight <= 0)
    errors.weight = "Enter a valid weight";
  else if (form.weightUnit === "kg" && (weight < 30 || weight > 300))
    errors.weight = "Weight seems off — check your value";
  else if (form.weightUnit === "lbs" && (weight < 66 || weight > 660))
    errors.weight = "Weight seems off — check your value";

  const height = parseFloat(form.heightVal);
  if (!form.heightVal || isNaN(height) || height <= 0)
    errors.height = "Enter a valid height";
  else if (form.heightUnit === "cm" && (height < 100 || height > 250))
    errors.height = "Height seems off — check your value";

  return errors;
};

export default function Step1Body({ form, onChange, onNext }) {
  const errors  = validate(form);
  const canProceed = form.age && form.heightVal && form.weightVal && Object.keys(errors).length === 0;

  const handleNext = () => {
    if (canProceed) onNext();
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Step 1 of 3 — Your Body</div>
        <h2 className={styles.title}>Tell us who you are</h2>
        <p className={styles.sub}>Precise inputs = precise outputs. No estimates, no averages.</p>
      </div>

      <div className="card">
        <div className="field">
          <label>First name <span>(optional — makes it personal)</span></label>
          <input
            placeholder="e.g. Arjun"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>

        <div className="row-2">
          <div className="field">
            <label>Age</label>
            <input
              type="number" placeholder="25" min={13} max={99}
              value={form.age}
              onChange={(e) => onChange("age", e.target.value)}
            />
            {form.age && errors.age && <div className={styles.fieldErr}>{errors.age}</div>}
          </div>
          <div className="field">
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => onChange("gender", e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="row-3">
          <div className="field">
            <label>Height{form.heightUnit === "ft" && <span> — e.g. 5'10</span>}</label>
            <input
              placeholder={form.heightUnit === "cm" ? "175" : "5'10"}
              value={form.heightVal}
              onChange={(e) => onChange("heightVal", e.target.value)}
            />
            {form.heightVal && errors.height && <div className={styles.fieldErr}>{errors.height}</div>}
          </div>
          <div className="field">
            <label>Unit</label>
            <select value={form.heightUnit} onChange={(e) => onChange("heightUnit", e.target.value)}>
              <option value="cm">cm</option>
              <option value="ft">ft / in</option>
            </select>
          </div>
        </div>

        <div className="row-3">
          <div className="field">
            <label>Weight</label>
            <input
              type="number"
              placeholder={form.weightUnit === "kg" ? "70" : "154"}
              value={form.weightVal}
              onChange={(e) => onChange("weightVal", e.target.value)}
            />
            {form.weightVal && errors.weight && <div className={styles.fieldErr}>{errors.weight}</div>}
          </div>
          <div className="field">
            <label>Unit</label>
            <select value={form.weightUnit} onChange={(e) => onChange("weightUnit", e.target.value)}>
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 8 }}>
          <label>
            Body fat %{" "}
            <span>(optional — unlocks Katch-McArdle, more accurate than Mifflin-St Jeor)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 18"
            min={3} max={60}
            value={form.bodyFat}
            onChange={(e) => onChange("bodyFat", e.target.value)}
          />
        </div>

        <button className="btn btn-primary" disabled={!canProceed} onClick={handleNext}>
          Continue →
        </button>
      </div>
    </>
  );
}