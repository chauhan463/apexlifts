import { CHECKIN_STORAGE_KEY } from "../constants";
import { getTodayLabel, loadPlan, getTodaysSession, findNextSession } from "../utils/trainingPlan";
import { loadWorkoutLogs, findLogForDate, todayISO } from "../utils/workoutLog";
import styles from "./Dashboard.module.css";

const todayLabel = getTodayLabel();
const todayDate = new Date().toLocaleDateString("en-GB", {
  weekday: "long", day: "numeric", month: "long",
});

function loadCheckins() {
  try { return JSON.parse(localStorage.getItem(CHECKIN_STORAGE_KEY)) || []; }
  catch { return []; }
}

export default function Dashboard({ profile, onViewBlueprint, onStartOver, onLogWorkout }) {
  const { form, results } = profile;
  const plan          = loadPlan(form.goal);
  const isTrainingDay = !!plan?.selectedDays.includes(todayLabel);
  const todaysSession = isTrainingDay ? getTodaysSession(plan, todayLabel) : null;
  const nextSession    = !isTrainingDay ? findNextSession(plan, todayLabel) : null;
  const lastCheckin    = loadCheckins()[0] || null;

  const workoutLogs   = loadWorkoutLogs();
  const todaysLog     = findLogForDate(workoutLogs, todayISO());
  const lastWorkout   = workoutLogs[0] || null;

  return (
    <div className={styles.wrap}>
      <div className={styles.greetHead}>
        <div className={styles.eyebrow}>{todayDate}</div>
        <h1 className={styles.greet}>
          {form.name ? <>Hey {form.name} 👋</> : <>Welcome back 👋</>}
        </h1>
      </div>

      {/* ── Today's workout — the headline answer to "what do I do today" ── */}
      <div className={`card ${styles.heroCard}`}>
        <div className={styles.cardHeadRow}>
          <div className="section-label" style={{ marginBottom: 0 }}>Today's workout</div>
          {todaysLog && <span className={styles.loggedBadge}>✓ Logged</span>}
        </div>

        {!plan && (
          <div className={styles.empty}>
            <p>You haven't built a training split yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => onViewBlueprint("Training")}>
              Build your split →
            </button>
          </div>
        )}

        {plan && isTrainingDay && todaysSession && (
          <>
            <div className={styles.sessionName}>{todaysSession.session.name}</div>
            <ul className={styles.exList}>
              {todaysSession.session.exercises.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
            <button className={`btn ${todaysLog ? "btn-ghost" : "btn-primary"} btn-sm`} onClick={onLogWorkout}>
              {todaysLog ? "Edit log →" : "Log this workout →"}
            </button>
          </>
        )}

        {plan && !isTrainingDay && (
          <div className={styles.rest}>
            <div className={styles.restLabel}>😴 Rest day</div>
            {nextSession && (
              <p className={styles.restNext}>
                Next up: <strong>{nextSession.day}</strong> — {nextSession.session.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Aim for today — the two numbers that actually matter day to day ── */}
      <div className="card">
        <div className="section-label">Aim for today</div>
        <div className={styles.targetRow}>
          <div className={styles.targetStat}>
            <div className={styles.targetNum}>{results.targetCals.toLocaleString()}</div>
            <div className={styles.targetUnit}>kcal</div>
          </div>
          <div className={styles.targetStat}>
            <div className={styles.targetNum}>{results.proteinG}g</div>
            <div className={styles.targetUnit}>protein</div>
          </div>
        </div>
      </div>

      {/* ── Recent progress — real signals only: logged workouts + check-ins ── */}
      <div className="card">
        <div className="section-label">Recent progress</div>
        <div className={styles.progressStack}>
          {lastWorkout ? (
            <div className={styles.progressRow}>
              <span>Last workout — {lastWorkout.day}, {lastWorkout.dateLabel}</span>
              <span className={styles.muted}>{lastWorkout.sessionName}</span>
            </div>
          ) : (
            <p className={styles.emptyNote}>No workouts logged yet.</p>
          )}

          {lastCheckin ? (
            <div className={styles.progressRow}>
              <span>Last check-in — {lastCheckin.date}</span>
              <span className={
                lastCheckin.tdeeDiff < -30 ? styles.amber :
                lastCheckin.tdeeDiff > 30  ? styles.green :
                styles.muted
              }>
                Real TDEE {lastCheckin.realTDEE.toLocaleString()} kcal
                {" "}({lastCheckin.tdeeDiff === 0 ? "±0" : `${lastCheckin.tdeeDiff > 0 ? "+" : "−"}${Math.abs(lastCheckin.tdeeDiff)}`} kcal vs formula)
              </span>
            </div>
          ) : (
            <p className={styles.emptyNote}>
              No check-ins yet — come back in 7 days to log your weight and see how your real numbers compare to the formula.
            </p>
          )}
        </div>
      </div>

      <div className={styles.footerRow}>
        <button className="btn btn-ghost btn-sm" onClick={() => onViewBlueprint()}>
          View full blueprint →
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onStartOver}>
          Start over
        </button>
      </div>
    </div>
  );
}
