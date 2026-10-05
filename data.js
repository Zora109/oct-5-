// Reference data: how long ingredients last, and recipes the planner can choose from.

// Shelf life in days per storage location. `null` = not recommended there.
// `best` is the recommended storage location.
const SHELF_LIFE = {
  // Vegetables
  "tomato":      { category: "Vegetable", best: "pantry",  fridge: 7,  freezer: 60,  pantry: 5 },
  "potato":      { category: "Vegetable", best: "pantry",  fridge: null, freezer: null, pantry: 30 },
  "onion":       { category: "Vegetable", best: "pantry",  fridge: 14, freezer: 180, pantry: 30 },
  "garlic":      { category: "Vegetable", best: "pantry",  fridge: null, freezer: 180, pantry: 60 },
  "ginger":      { category: "Vegetable", best: "fridge",  fridge: 21, freezer: 180, pantry: 7 },
  "scallion":    { category: "Vegetable", best: "fridge",  fridge: 7,  freezer: 90,  pantry: null },
  "carrot":      { category: "Vegetable", best: "fridge",  fridge: 21, freezer: 240, pantry: null },
  "broccoli":    { category: "Vegetable", best: "fridge",  fridge: 5,  freezer: 240, pantry: null },
  "bok choy":    { category: "Vegetable", best: "fridge",  fridge: 4,  freezer: null, pantry: null },
  "spinach":     { category: "Vegetable", best: "fridge",  fridge: 4,  freezer: 240, pantry: null },
  "lettuce":     { category: "Vegetable", best: "fridge",  fridge: 7,  freezer: null, pantry: null },
  "cabbage":     { category: "Vegetable", best: "fridge",  fridge: 30, freezer: null, pantry: null },
  "bell pepper": { category: "Vegetable", best: "fridge",  fridge: 10, freezer: 180, pantry: null },
  "cucumber":    { category: "Vegetable", best: "fridge",  fridge: 7,  freezer: null, pantry: null },
  "eggplant":    { category: "Vegetable", best: "fridge",  fridge: 5,  freezer: null, pantry: 2 },
  "mushroom":    { category: "Vegetable", best: "fridge",  fridge: 6,  freezer: 240, pantry: null },
  "zucchini":    { category: "Vegetable", best: "fridge",  fridge: 6,  freezer: 120, pantry: null },
  "corn":        { category: "Vegetable", best: "fridge",  fridge: 3,  freezer: 240, pantry: null },
  "green bean":  { category: "Vegetable", best: "fridge",  fridge: 6,  freezer: 240, pantry: null },
  "celery":      { category: "Vegetable", best: "fridge",  fridge: 14, freezer: null, pantry: null },

  // Fruit
  "apple":       { category: "Fruit", best: "fridge",  fridge: 30, freezer: null, pantry: 7 },
  "banana":      { category: "Fruit", best: "pantry",  fridge: null, freezer: 90, pantry: 5 },
  "lemon":       { category: "Fruit", best: "fridge",  fridge: 21, freezer: null, pantry: 7 },
  "strawberry":  { category: "Fruit", best: "fridge",  fridge: 4,  freezer: 240, pantry: null },
  "avocado":     { category: "Fruit", best: "pantry",  fridge: 4,  freezer: null, pantry: 4 },

  // Protein
  "egg":         { category: "Protein", best: "fridge",  fridge: 28, freezer: null, pantry: null },
  "chicken":     { category: "Protein", best: "fridge",  fridge: 2,  freezer: 270, pantry: null },
  "beef":        { category: "Protein", best: "fridge",  fridge: 3,  freezer: 180, pantry: null },
  "ground beef": { category: "Protein", best: "fridge",  fridge: 2,  freezer: 120, pantry: null },
  "pork":        { category: "Protein", best: "fridge",  fridge: 3,  freezer: 180, pantry: null },
  "fish":        { category: "Protein", best: "fridge",  fridge: 2,  freezer: 180, pantry: null },
  "shrimp":      { category: "Protein", best: "freezer", fridge: 2,  freezer: 180, pantry: null },
  "tofu":        { category: "Protein", best: "fridge",  fridge: 5,  freezer: 120, pantry: null },
  "bacon":       { category: "Protein", best: "fridge",  fridge: 7,  freezer: 30,  pantry: null },

  // Dairy
  "milk":        { category: "Dairy", best: "fridge",  fridge: 7,  freezer: 90,  pantry: null },
  "cheese":      { category: "Dairy", best: "fridge",  fridge: 21, freezer: 180, pantry: null },
  "butter":      { category: "Dairy", best: "fridge",  fridge: 60, freezer: 270, pantry: null },
  "yogurt":      { category: "Dairy", best: "fridge",  fridge: 14, freezer: 60,  pantry: null },

  // Grains & dry goods
  "rice":        { category: "Grain", best: "pantry",  fridge: null, freezer: null, pantry: 365 },
  "pasta":       { category: "Grain", best: "pantry",  fridge: null, freezer: null, pantry: 365 },
  "noodle":      { category: "Grain", best: "pantry",  fridge: 5,  freezer: 60,  pantry: 180 },
  "bread":       { category: "Grain", best: "pantry",  fridge: 10, freezer: 90,  pantry: 4 },
  "tortilla":    { category: "Grain", best: "pantry",  fridge: 21, freezer: 180, pantry: 7 },
  "oats":        { category: "Grain", best: "pantry",  fridge: null, freezer: null, pantry: 365 },
  "flour":       { category: "Grain", best: "pantry",  fridge: null, freezer: null, pantry: 240 },
  "canned tomato": { category: "Other", best: "pantry", fridge: null, freezer: null, pantry: 540 },
  "dumpling":    { category: "Other", best: "freezer", fridge: 2,  freezer: 90,  pantry: null },
};

// Spellings people type -> the key used in SHELF_LIFE and RECIPES.
const ALIASES = {
  "tomatoes": "tomato", "potatoes": "potato", "onions": "onion", "eggs": "egg",
  "green onion": "scallion", "spring onion": "scallion", "scallions": "scallion",
  "pak choi": "bok choy", "bokchoy": "bok choy", "carrots": "carrot",
  "mushrooms": "mushroom", "peppers": "bell pepper", "pepper": "bell pepper",
  "chicken breast": "chicken", "chicken thigh": "chicken", "steak": "beef",
  "minced beef": "ground beef", "salmon": "fish", "cod": "fish", "prawn": "shrimp",
  "prawns": "shrimp", "noodles": "noodle", "spaghetti": "pasta", "dumplings": "dumpling",
  "beans": "green bean", "green beans": "green bean", "apples": "apple", "bananas": "banana",
  "strawberries": "strawberry", "lemons": "lemon", "avocados": "avocado",
  "番茄": "tomato", "西红柿": "tomato", "土豆": "potato", "洋葱": "onion", "大蒜": "garlic",
  "姜": "ginger", "葱": "scallion", "胡萝卜": "carrot", "西兰花": "broccoli", "青菜": "bok choy",
  "菠菜": "spinach", "生菜": "lettuce", "白菜": "cabbage", "青椒": "bell pepper", "黄瓜": "cucumber",
  "茄子": "eggplant", "蘑菇": "mushroom", "鸡蛋": "egg", "鸡肉": "chicken", "牛肉": "beef",
  "猪肉": "pork", "鱼": "fish", "虾": "shrimp", "豆腐": "tofu", "牛奶": "milk", "米": "rice",
  "大米": "rice", "面条": "noodle", "面包": "bread", "饺子": "dumpling",
};

// Recipes reference SHELF_LIFE keys. Staples (oil, salt, soy sauce...) are assumed on hand.
const RECIPES = [
  { name: "Tomato & Egg Stir-fry (番茄炒蛋)", ingredients: ["tomato", "egg"], optional: ["scallion"], minutes: 15 },
  { name: "Egg Fried Rice", ingredients: ["rice", "egg"], optional: ["scallion", "carrot", "corn", "shrimp"], minutes: 15 },
  { name: "Mapo-style Tofu", ingredients: ["tofu", "ground beef"], optional: ["scallion", "garlic", "ginger"], minutes: 20 },
  { name: "Braised Tofu (红烧豆腐)", ingredients: ["tofu"], optional: ["scallion", "garlic", "mushroom"], minutes: 20 },
  { name: "Garlic Bok Choy", ingredients: ["bok choy", "garlic"], optional: [], minutes: 10 },
  { name: "Beef & Broccoli", ingredients: ["beef", "broccoli"], optional: ["garlic", "ginger", "rice"], minutes: 25 },
  { name: "Shredded Potato Stir-fry (酸辣土豆丝)", ingredients: ["potato"], optional: ["bell pepper", "garlic"], minutes: 20 },
  { name: "Kung Pao Chicken", ingredients: ["chicken"], optional: ["bell pepper", "scallion", "garlic", "ginger"], minutes: 25 },
  { name: "Braised Eggplant", ingredients: ["eggplant", "garlic"], optional: ["pork", "scallion"], minutes: 25 },
  { name: "Pork & Cabbage Stir-fry", ingredients: ["pork", "cabbage"], optional: ["garlic"], minutes: 20 },
  { name: "Shrimp Noodle Soup", ingredients: ["noodle", "shrimp"], optional: ["bok choy", "egg", "scallion"], minutes: 20 },
  { name: "Pan-fried Dumplings", ingredients: ["dumpling"], optional: ["scallion"], minutes: 15 },
  { name: "Steamed Fish with Ginger & Scallion", ingredients: ["fish", "ginger", "scallion"], optional: [], minutes: 25 },
  { name: "Spaghetti Bolognese", ingredients: ["pasta", "ground beef", "canned tomato"], optional: ["onion", "carrot", "garlic"], minutes: 40 },
  { name: "Pasta with Tomato & Garlic", ingredients: ["pasta", "tomato", "garlic"], optional: ["cheese", "spinach"], minutes: 20 },
  { name: "Chicken Curry", ingredients: ["chicken", "potato", "onion"], optional: ["carrot", "rice"], minutes: 45 },
  { name: "Vegetable Omelette", ingredients: ["egg"], optional: ["mushroom", "spinach", "bell pepper", "cheese", "onion"], minutes: 10 },
  { name: "Mushroom & Spinach Pasta", ingredients: ["pasta", "mushroom", "spinach"], optional: ["garlic", "cheese", "butter"], minutes: 25 },
  { name: "Chicken Tacos", ingredients: ["chicken", "tortilla"], optional: ["lettuce", "tomato", "avocado", "cheese", "lemon"], minutes: 25 },
  { name: "Green Salad", ingredients: ["lettuce"], optional: ["cucumber", "tomato", "avocado", "carrot", "lemon"], minutes: 10 },
  { name: "Cucumber Salad (拍黄瓜)", ingredients: ["cucumber", "garlic"], optional: [], minutes: 10 },
  { name: "Zucchini & Green Bean Stir-fry", ingredients: ["zucchini", "green bean"], optional: ["garlic", "carrot"], minutes: 15 },
  { name: "Fruit Yogurt Bowl", ingredients: ["yogurt"], optional: ["banana", "strawberry", "apple", "oats"], minutes: 5 },
  { name: "Overnight Oats", ingredients: ["oats", "milk"], optional: ["banana", "strawberry", "apple"], minutes: 5 },
  { name: "Grilled Cheese Sandwich", ingredients: ["bread", "cheese", "butter"], optional: ["tomato", "bacon"], minutes: 10 },
  { name: "Bacon & Egg Breakfast", ingredients: ["bacon", "egg"], optional: ["bread", "tomato"], minutes: 15 },
  { name: "Celery & Pork Stir-fry", ingredients: ["celery", "pork"], optional: ["carrot", "garlic"], minutes: 20 },
];
