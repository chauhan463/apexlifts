import styles from "./MacroFoodGuide.module.css";

/**
 * Translates macro gram targets into real food amounts.
 * Quantities are per day — not per meal.
 */
function buildFoods(proteinG, carbG, fatG) {
  return {
    protein: [
      { food: "Whey protein",   amount: `${(proteinG / 25).toFixed(1)} scoops`, note: "~25g protein / scoop" },
      { food: "Chicken breast", amount: `${Math.round(proteinG / 0.31 / 10) * 10}g`, note: "cooked, ~31g/100g" },
      { food: "Eggs",           amount: `${Math.round(proteinG / 6)}`,           note: "large eggs, ~6g each" },
    ],
    carbs: [
      { food: "Cooked rice",    amount: `${Math.round(carbG / 0.28 / 10) * 10}g`, note: "white rice, ~28g/100g" },
      { food: "Oats",           amount: `${Math.round(carbG / 0.60 / 10) * 10}g`, note: "dry oats, ~60g/100g" },
      { food: "Sweet potato",   amount: `${Math.round(carbG / 0.20 / 10) * 10}g`, note: "cooked, ~20g/100g" },
    ],
    fats: [
      { food: "Olive oil",      amount: `${(fatG / 14).toFixed(1)} tbsp`,          note: "~14g fat / tbsp" },
      { food: "Almonds",        amount: `${Math.round(fatG / 0.50 / 5) * 5}g`,     note: "~50g fat / 100g" },
      { food: "Whole eggs",     amount: `${Math.round(fatG / 5)}`,                  note: "~5g fat each (yolk)" },
    ],
  };
}

const MacroSection = ({ color, label, grams, kcal, foods }) => (
  <div className={`${styles.section} ${styles[color]}`}>
    <div className={styles.macroHeader}>
      <span className={styles.macroName}>{label}</span>
      <span className={styles.macroAmount}>{grams}g · {kcal} kcal</span>
    </div>
    <div className={styles.foods}>
      {foods.map((f) => (
        <div className={styles.foodRow} key={f.food}>
          <span className={styles.foodAmount}>{f.amount}</span>
          <span className={styles.foodName}>{f.food}</span>
          <span className={styles.foodNote}>{f.note}</span>
        </div>
      ))}
    </div>
    <p className={styles.caveat}>Mix and match — these are examples, not a meal plan.</p>
  </div>
);

export default function MacroFoodGuide({ proteinG, carbG, fatG }) {
  const foods = buildFoods(proteinG, carbG, fatG);
  return (
    <div className={styles.wrap}>
      <div className="section-label">What {proteinG}g protein looks like</div>
      <MacroSection color="p" label="Protein" grams={proteinG} kcal={proteinG * 4} foods={foods.protein} />
      <MacroSection color="c" label="Carbs"   grams={carbG}    kcal={carbG * 4}    foods={foods.carbs}   />
      <MacroSection color="f" label="Fats"    grams={fatG}     kcal={fatG * 9}     foods={foods.fats}    />
    </div>
  );
}
