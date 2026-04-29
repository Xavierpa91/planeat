// Sample data — Mediterranean / European cuisine
// Using a date in the user's "current date" range (Apr 28 - May 4, 2026 = Mon-Sun)

const SEED_RECIPES = [
  {
    id: "r1",
    name: "Pasta al Pomodoro",
    icon: "pasta",
    ingredients: ["Spaghetti", "San Marzano tomatoes", "Garlic", "Fresh basil", "Olive oil", "Parmigiano"],
  },
  {
    id: "r2",
    name: "Caesar Salad",
    icon: "salad",
    ingredients: ["Romaine lettuce", "Anchovies", "Parmigiano", "Sourdough croutons", "Lemon", "Egg yolk"],
  },
  {
    id: "r3",
    name: "Roasted Lemon Chicken",
    icon: "chicken",
    ingredients: ["Whole chicken", "Lemon", "Rosemary", "Garlic", "Olive oil", "Sea salt"],
  },
  {
    id: "r4",
    name: "Sea Bass en Papillote",
    icon: "fish",
    ingredients: ["Sea bass fillets", "Cherry tomatoes", "Capers", "Black olives", "White wine", "Thyme"],
  },
  {
    id: "r5",
    name: "Minestrone",
    icon: "soup",
    ingredients: ["Cannellini beans", "Carrot", "Celery", "Zucchini", "Tomato", "Pancetta", "Ditalini"],
  },
  {
    id: "r6",
    name: "Margherita Pizza",
    icon: "pizza",
    ingredients: ["Pizza dough", "San Marzano tomatoes", "Mozzarella di bufala", "Basil", "Olive oil"],
  },
  {
    id: "r7",
    name: "Greek Mezze Bowl",
    icon: "bowl",
    ingredients: ["Hummus", "Tzatziki", "Tabbouleh", "Pita", "Feta", "Kalamata olives", "Cucumber"],
  },
  {
    id: "r8",
    name: "Paella Valenciana",
    icon: "rice",
    ingredients: ["Bomba rice", "Saffron", "Chicken thighs", "Rabbit", "Green beans", "Lima beans", "Smoked paprika"],
  },
];

// Default plan: Mon Apr 28 - Sun May 3 (close enough to the spec's range)
const SEED_PLAN = {
  Mon: { lunch: "r2", dinner: "r1" },
  Tue: { lunch: null, dinner: "r3" },
  Wed: { lunch: "r5", dinner: null },
  Thu: { lunch: null, dinner: "r4" },
  Fri: { lunch: null, dinner: "r6" },
  Sat: { lunch: "r7", dinner: "r8" },
  Sun: { lunch: null, dinner: { custom: "Leftovers night" } },
};

const DAY_KEYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

// week starting Mon Apr 28, 2026
function fmtRange(weekOffset, weekStart) {
  // weekStart: "mon" | "sun"
  const base = new Date(2026, 3, 27); // Apr 27 = Monday
  const startOffset = weekStart === "sun" ? -1 : 0;
  const start = new Date(base);
  start.setDate(start.getDate() + weekOffset * 7 + startOffset);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${m[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${m[start.getMonth()]} ${start.getDate()} – ${m[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

function orderedDays(weekStart) {
  if (weekStart === "sun") return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return DAY_KEYS;
}

// Build a shopping list from the plan + recipe map
function buildShopping(plan, recipeMap) {
  const counts = new Map();
  for (const day of DAY_KEYS) {
    for (const slot of ["lunch","dinner"]) {
      const v = plan[day]?.[slot];
      if (!v || typeof v !== "string") continue;
      const r = recipeMap[v];
      if (!r) continue;
      for (const ing of r.ingredients) {
        const k = ing.toLowerCase();
        if (counts.has(k)) {
          const o = counts.get(k);
          counts.set(k, { ...o, n: o.n + 1, recipes: [...o.recipes, r.name] });
        } else {
          counts.set(k, { name: ing, n: 1, recipes: [r.name] });
        }
      }
    }
  }
  return [...counts.values()].sort((a,b) => a.name.localeCompare(b.name));
}

Object.assign(window, {
  SEED_RECIPES, SEED_PLAN, DAY_KEYS, DAY_FULL,
  fmtRange, orderedDays, buildShopping,
});
