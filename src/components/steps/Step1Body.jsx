import { useState } from "react";
import { calcBMR, toCm, toKg } from "../../utils/calculations";
import styles from "./Steps.module.css";

// Parse "5'10" stored value back to { ft, inch }
const parseFtIn = (val) => {
  if (!val) return { ft: "", inch: "" };
  const str = String(val);
  if (str.includes("'")) {
    const [ft, inch] = str.split("'");
    return { ft: ft ?? "", inch: inch ?? "" };
  }
  return { ft: str, inch: "" };
};

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

  if (form.heightUnit === "cm") {
    const height = parseFloat(form.heightVal);
    if (!form.heightVal || isNaN(height) || height <= 0)
      errors.height = "Enter a valid height";
    else if (height < 100 || height > 250)
      errors.height = "Height seems off — check your value";
  } else {
    const { ft, inch } = parseFtIn(form.heightVal);
    const ftNum = parseInt(ft);
    const inNum = parseFloat(inch) || 0;
    if (!ft || isNaN(ftNum) || ftNum <= 0)
      errors.height = "Enter a valid height";
    else if (ftNum < 3 || ftNum > 8)
      errors.height = "Height seems off — check your value";
    else if (inNum < 0 || inNum > 11)
      errors.heightIn = "Inches must be 0 – 11";
  }

  return errors;
};

export default function StepBody({ form, onChange, onNext, onBack }) {
  const [showOptional, setShowOptional] = useState(false);

  const errors = validate(form);
  const canProceed = form.age && form.heightVal && form.weightVal && Object.keys(errors).length === 0;

  const { ft, inch } = parseFtIn(form.heightVal);

  const handleFtChange  = (newFt)  => onChange("heightVal", `${newFt}'${inch}`);
  const handleInChange  = (newIn)  => onChange("heightVal", `${ft}'${newIn}`);

  // Live rough maintenance estimate — shown when all body fields are valid
  const roughMaintenance = (() => {
    if (!canProceed) return null;
    const age = parseInt(form.age);
    const wKg = toKg(form.weightVal, form.weightUnit);
    const hCm = toCm(form.heightVal, form.heightUnit);
    if (!age || !wKg || !hCm) return null;
    const bmr = calcBMR(wKg, hCm, age, form.gender);
    return Math.round((bmr * 1.5) / 50) * 50;
  })();

  return (
    <>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Step 2 of 3 — Your Body</div>
        <h2 className={styles.title}>Tell us about your body</h2>
        <p className={styles.sub}>Precise inputs = precise outputs. No estimates, no averages.</p>
      </div>

      <div className="card">
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

        {form.heightUnit === "cm" ? (
          <div className="row-3">
            <div className="field">
              <label>Height</label>
              <input
                type="number"
                placeholder="175"
                value={form.heightVal}
                onChange={(e) => onChange("heightVal", e.target.value)}
              />
              {form.heightVal && errors.height && <div className={styles.fieldErr}>{errors.height}</div>}
            </div>
            <div className="field">
              <label>Unit</label>
              <select value={form.heightUnit} onChange={(e) => { onChange("heightUnit", e.target.value); onChange("heightVal", ""); }}>
                <option value="cm">cm</option>
                <option value="ft">ft / in</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="row-3">
            <div className="field">
              <label>Feet</label>
              <input
                type="number" placeholder="5" min={3} max={8}
                value={ft}
                onChange={(e) => handleFtChange(e.target.value)}
              />
              {ft && errors.height && <div className={styles.fieldErr}>{errors.height}</div>}
            </div>
            <div className="field">
              <label>Inches</label>
              <input
                type="number" placeholder="10" min={0} max={11}
                value={inch}
                onChange={(e) => handleInChange(e.target.value)}
              />
              {inch && errors.heightIn && <div className={styles.fieldErr}>{errors.heightIn}</div>}
            </div>
            <div className="field">
              <label>Unit</label>
              <select value={form.heightUnit} onChange={(e) => { onChange("heightUnit", e.target.value); onChange("heightVal", ""); }}>
                <option value="cm">cm</option>
                <option value="ft">ft / in</option>
              </select>
            </div>
          </div>
        )}

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

        {/* Optional fields toggle */}
        <div
          className={styles.optionalToggle}
          onClick={() => setShowOptional((s) => !s)}
        >
          <span>{showOptional ? "▲" : "+"} Optional details</span>
          <span className={styles.optionalHint}>name · body fat %</span>
        </div>

        {showOptional && (
          <div className={styles.optionalFields}>
            <div className="field">
              <label>First name <span>(makes it personal)</span></label>
              <input
                placeholder="e.g. Arjun"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                Body fat % <span>(unlocks Katch-McArdle, more accurate than Mifflin-St Jeor)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 18"
                min={3} max={60}
                value={form.bodyFat}
                onChange={(e) => onChange("bodyFat", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Live calorie preview */}
        {roughMaintenance && (
          <div className={styles.preview}>
            Your maintenance is roughly{" "}
            <strong>~{roughMaintenance.toLocaleString()} kcal</strong>
            {" "}— complete the next step to get your exact number.
          </div>
        )}

        <button className="btn btn-primary" disabled={!canProceed} onClick={onNext}>
          Continue →
        </button>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </>
  );
}
