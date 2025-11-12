# Tizen Recipe App Frontend

A Tizen-ready recipe explorer built with React + Vite, styled with the Ocean Professional theme.

- Runs in the existing container on port 3000
- Works with keyboard/remote arrows, ENTER, and BACK
- Includes: Home, Search, Favorites, Settings, and Recipe Detail

## Scripts

- npm run dev — start dev server at port 3000
- npm run build — production build
- npm run preview — preview built app
- npm run build:tizen — alias for build
- npm run package:tizen — generate app.wgt from dist + config.xml

## Navigation

- Bottom nav has: Home, Search, Favorites, Settings
- Use arrow keys to move focus in the grid
- Press ENTER to open a recipe
- In detail view: ENTER toggles Favorite; use Prev/Next to walk through steps
- Press BACK to return (from detail to grid; from other tabs to Home)

## Data

- Mock data lives at src/data/recipes.js (10+ recipes)
- Swappable with a real API later; keep the same shape: { id, title, description, image, time, difficulty, ingredients[], steps[] }

## Favorites

- Stored locally via localStorage under key "favorites"
- Accessible in the Favorites tab

## Tizen notes

- Fixed viewport at 1920x1080 configured in index.html
- Arrow keys, ENTER (13), and BACK (10009) handled in src/hooks/useTizenKeys.js

## Style Guide

- Ocean Professional: primary #2563EB, secondary/success #F59E0B, error #EF4444, background #f9fafb, surface #ffffff, text #111827
- Subtle shadows, rounded corners, gradients for depth
