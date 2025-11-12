import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTizenKeys } from './hooks/useTizenKeys'
import './App.css'
import './index.css'

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Ocean Professional theme tokens (kept in code for simplicity).
   */
  const theme = useMemo(() => ({
    primary: '#2563EB',
    secondary: '#F59E0B',
    success: '#F59E0B',
    error: '#EF4444',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
  }), []);

  // Tabs: home | search | favorites | settings
  const [tab, setTab] = useState('home');
  // Recipes data
  const [recipes, setRecipes] = useState([]);
  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem('favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Navigation state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [gridFocusIndex, setGridFocusIndex] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Load mock data
  useEffect(() => {
    import('./data/recipes').then((m) => setRecipes(m.recipes));
  }, []);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.toLowerCase().trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }, []);

  const backToGrid = useCallback(() => {
    setSelectedRecipe(null);
  }, []);

  const onOpenRecipe = useCallback((r) => {
    setSelectedRecipe(r);
  }, []);

  // Filtered lists
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return recipes;
    return recipes.filter((r) => {
      const hay = `${r.title} ${r.description} ${r.ingredients.join(' ')}`.toLowerCase();
      return hay.includes(debouncedQuery);
    });
  }, [recipes, debouncedQuery]);

  const favoriteRecipes = useMemo(() => {
    return recipes.filter((r) => favorites.includes(r.id));
  }, [recipes, favorites]);

  // Handle keyboard/remote navigation
  useTizenKeys({
    onBack: () => {
      if (selectedRecipe) {
        backToGrid();
      } else if (tab !== 'home') {
        setTab('home');
      }
    },
    onEnter: () => {
      if (!selectedRecipe) {
        const list = tab === 'home' ? recipes : tab === 'favorites' ? favoriteRecipes : tab === 'search' ? searchResults : [];
        if (list.length > 0 && list[gridFocusIndex]) {
          onOpenRecipe(list[gridFocusIndex]);
        }
      } else {
        // In detail view, toggle favorite when ENTER pressed
        toggleFavorite(selectedRecipe.id);
      }
    },
    onLeft: () => {
      if (selectedRecipe) return;
      const cols = 5;
      setGridFocusIndex((i) => (i % cols === 0 ? i : i - 1));
    },
    onRight: () => {
      if (selectedRecipe) return;
      const cols = 5;
      const listLen = tab === 'home' ? recipes.length : tab === 'favorites' ? favoriteRecipes.length : tab === 'search' ? searchResults.length : 0;
      setGridFocusIndex((i) => (i % cols === cols - 1 || i + 1 >= listLen ? i : i + 1));
    },
    onUp: () => {
      if (selectedRecipe) return;
      const cols = 5;
      setGridFocusIndex((i) => (i - cols >= 0 ? i - cols : i));
    },
    onDown: () => {
      if (selectedRecipe) return;
      const cols = 5;
      const listLen = tab === 'home' ? recipes.length : tab === 'favorites' ? favoriteRecipes.length : tab === 'search' ? searchResults.length : 0;
      setGridFocusIndex((i) => (i + cols < listLen ? i + cols : i));
    },
  });

  // Layout
  return (
    <div className="app-root" style={{ background: theme.background, color: theme.text }}>
      <Header theme={theme} />
      <main className="main-area">
        {!selectedRecipe && tab === 'home' && (
          <GridView
            title="Discover Recipes"
            items={recipes}
            theme={theme}
            focusIndex={gridFocusIndex}
            onCardEnter={onOpenRecipe}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}
        {!selectedRecipe && tab === 'search' && (
          <SearchView
            theme={theme}
            query={searchQuery}
            setQuery={setSearchQuery}
            results={searchResults}
            focusIndex={gridFocusIndex}
            onCardEnter={onOpenRecipe}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}
        {!selectedRecipe && tab === 'favorites' && (
          <GridView
            title="Your Favorites"
            items={favoriteRecipes}
            theme={theme}
            focusIndex={gridFocusIndex}
            onCardEnter={onOpenRecipe}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            emptyText="No favorites yet. Add some from Home or Search."
          />
        )}
        {!selectedRecipe && tab === 'settings' && <SettingsView theme={theme} />}
        {selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            theme={theme}
            onBack={backToGrid}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}
      </main>
      {!selectedRecipe && (
        <BottomNav tab={tab} setTab={(t) => { setTab(t); setGridFocusIndex(0); }} theme={theme} />
      )}
    </div>
  );
}

function Header({ theme }) {
  return (
    <header
      className="header"
      style={{
        background: `linear-gradient(90deg, ${theme.primary}1A, ${theme.surface})`,
        color: theme.text,
        borderBottom: `1px solid ${theme.primary}22`,
      }}
    >
      <div className="brand">
        <span className="brand-logo" />
        <h1>Ocean Recipes</h1>
      </div>
      <div className="header-right">
        <span className="badge">Tizen</span>
      </div>
    </header>
  );
}

function GridView({
  title,
  items,
  theme,
  focusIndex,
  onCardEnter,
  onToggleFavorite,
  isFavorite,
  emptyText = 'No items available.',
}) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {items.length === 0 ? (
        <div className="empty">{emptyText}</div>
      ) : (
        <div className="grid">
          {items.map((r, idx) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              theme={theme}
              focused={idx === focusIndex}
              onEnter={() => onCardEnter(r)}
              onToggleFavorite={() => onToggleFavorite(r.id)}
              favorite={isFavorite(r.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SearchView({
  theme,
  query,
  setQuery,
  results,
  focusIndex,
  onCardEnter,
  onToggleFavorite,
  isFavorite,
}) {
  return (
    <section className="section">
      <h2 className="section-title">Search</h2>
      <div className="searchbar" style={{ borderColor: theme.primary }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes, ingredients..."
          aria-label="Search recipes"
        />
      </div>
      <div className="grid">
        {results.map((r, idx) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            theme={theme}
            focused={idx === focusIndex}
            onEnter={() => onCardEnter(r)}
            onToggleFavorite={() => onToggleFavorite(r.id)}
            favorite={isFavorite(r.id)}
          />
        ))}
      </div>
    </section>
  );
}

function SettingsView({ theme }) {
  return (
    <section className="section">
      <h2 className="section-title">Settings</h2>
      <div className="card" style={{ background: theme.surface }}>
        <p>
          This is a demo UI designed for Tizen devices. Use arrow keys to move focus,
          ENTER to select, and BACK to navigate up.
        </p>
        <ul className="list">
          <li>Theme: Ocean Professional</li>
          <li>Layout: Bottom navigation + grid + detail</li>
          <li>Data: Local mock JSON (swappable later)</li>
        </ul>
      </div>
    </section>
  );
}

function RecipeCard({ recipe, theme, focused, onEnter, onToggleFavorite, favorite }) {
  return (
    <div
      className={`recipe-card ${focused ? 'focused' : ''}`}
      tabIndex={focused ? 0 : -1}
      onClick={onEnter}
      role="button"
      aria-label={`Open ${recipe.title}`}
      style={{
        background: theme.surface,
        borderColor: focused ? theme.primary : 'transparent',
      }}
    >
      <div className="thumb" style={{ backgroundImage: `url(${recipe.image})` }} />
      <div className="card-body">
        <div className="card-title">{recipe.title}</div>
        <div className="card-meta">
          <span>{recipe.time} min</span>
          <span>•</span>
          <span>{recipe.difficulty}</span>
        </div>
      </div>
      <button
        className={`fav ${favorite ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        style={{
          borderColor: favorite ? theme.secondary : `${theme.text}22`,
          color: favorite ? theme.secondary : theme.text,
        }}
      >
        {favorite ? '★' : '☆'}
      </button>
    </div>
  );
}

function RecipeDetail({ recipe, theme, onBack, onToggleFavorite, isFavorite }) {
  const [checked, setChecked] = useState(() => recipe.ingredients.map(() => false));
  const [stepIndex, setStepIndex] = useState(0);
  const favorite = isFavorite(recipe.id);

  useEffect(() => {
    // Reset when recipe changes
    setChecked(recipe.ingredients.map(() => false));
    setStepIndex(0);
  }, [recipe]);

  return (
    <section className="detail" style={{ background: theme.surface }}>
      <div className="detail-hero" style={{ backgroundImage: `url(${recipe.image})` }}>
        <div className="hero-overlay">
          <button className="back" onClick={onBack} aria-label="Back" style={{ borderColor: theme.primary }}>
            ← Back
          </button>
          <div className="hero-info">
            <h2>{recipe.title}</h2>
            <div className="hero-meta">
              <span>{recipe.time} min</span>
              <span>•</span>
              <span>{recipe.difficulty}</span>
              <button
                className={`fav-lg ${favorite ? 'active' : ''}`}
                onClick={() => onToggleFavorite(recipe.id)}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{
                  borderColor: favorite ? theme.secondary : `${theme.text}22`,
                  color: favorite ? theme.secondary : theme.text,
                }}
              >
                {favorite ? '★ Favorited' : '☆ Favorite'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="ingredients card">
          <h3>Ingredients</h3>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setChecked((prev) => {
                        const copy = [...prev];
                        copy[i] = v;
                        return copy;
                      });
                    }}
                  />
                  <span className={`checkmark ${checked[i] ? 'on' : ''}`} style={{ borderColor: theme.primary }} />
                  <span className={`ing-text ${checked[i] ? 'done' : ''}`}>{ing}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="steps card">
          <h3>Steps</h3>
          <div className="progress">
            <div
              className="bar"
              style={{ width: `${((stepIndex + 1) / recipe.steps.length) * 100}%`, background: theme.primary }}
            />
          </div>
          <ol className="steps-list">
            {recipe.steps.map((s, i) => (
              <li key={i} className={i === stepIndex ? 'active' : ''}>
                <div className="step-index">{i + 1}</div>
                <div className="step-text">{s}</div>
              </li>
            ))}
          </ol>
          <div className="step-actions">
            <button
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              aria-label="Previous step"
              className="btn"
              style={{ borderColor: theme.primary }}
            >
              ◀ Prev
            </button>
            <button
              onClick={() => setStepIndex((i) => Math.min(recipe.steps.length - 1, i + 1))}
              aria-label="Next step"
              className="btn"
              style={{ borderColor: theme.primary }}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BottomNav({ tab, setTab, theme }) {
  const items = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔎' },
    { id: 'favorites', label: 'Favorites', icon: '★' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav
      className="bottom-nav"
      style={{
        background: theme.surface,
        borderTop: `1px solid ${theme.primary}22`,
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          className={`nav-item ${tab === it.id ? 'active' : ''}`}
          onClick={() => setTab(it.id)}
          aria-label={it.label}
          style={{
            color: tab === it.id ? theme.primary : theme.text,
          }}
        >
          <span className="icon">{it.icon}</span>
          <span className="label">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
