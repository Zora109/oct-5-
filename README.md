# Fridge Keeper

A small web app for tracking groceries, using them before they spoil, and deciding what to cook.

**Run it:** double-click `index.html` (no installs or server needed). Data is saved in your browser.

## Features
- **My Ingredients:** add what you bought. The use-by date fills in from a shelf-life table, and the app
  tells you where to store each item (fridge / freezer / pantry). Items are sorted by urgency, and items
  about to spoil show a **Freeze** button. Understands some Chinese names (番茄, 豆腐, 青菜…).
- **Cook Today:** ranks recipes by what you have. Ingredients that expire soon count most.
  "Cook this" lets you mark which ingredients were used up.
- **Meal Plan:** plans 3–7 days ahead and gives each ingredient to only one meal, so food gets used
  in time. It also lists anything that will still expire unused.

## Customize
- `data.js`: add ingredients to `SHELF_LIFE`, other spellings to `ALIASES`, and your own dishes to `RECIPES`.
- `app.js`: the app logic (`matchRecipe` scores recipes; `buildPlan` makes the meal plan).
