// PlanEat main app shell

const { useState: uS, useEffect: uE, useMemo: uMm, useRef: uRr } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 152,
  "darkMode": false,
  "radius": "soft",
  "density": "balanced",
  "weekStart": "mon",
  "navLabels": "show",
  "menuLayout": "grid"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // theme application
  uE(() => {
    const root = document.body;
    root.dataset.theme = tweaks.darkMode ? "dark" : "light";
    root.dataset.radius = tweaks.radius;
    root.dataset.density = tweaks.density;
    root.dataset.navlabels = tweaks.navLabels;
    document.documentElement.style.setProperty("--accent-h", tweaks.accentHue);
  }, [tweaks]);

  // app state
  const [authed, setAuthed] = uS(true); // start logged in (decided for them)
  const [tab, setTab] = uS("menu");
  const [recipes, setRecipes] = uS(SEED_RECIPES);
  const [plan, setPlan] = uS(SEED_PLAN);
  const [weekOffset, setWeekOffset] = uS(0);
  const [shoppingChecked, setShoppingChecked] = uS(new Set(["garlic","olive oil"]));
  const [shoppingHidden, setShoppingHidden] = uS(new Set());
  const [household, setHousehold] = uS({ name: "Casa Romano" });
  const [members, setMembers] = uS([
    { name: "Alex Romano", email: "alex@example.com", role: "owner", color: "var(--accent-strong)", you: true },
    { name: "Mara Romano", email: "mara@example.com", role: "member", color: "oklch(0.65 0.16 30)" },
  ]);

  // sheets / overlays
  const [addSheet, setAddSheet] = uS(null); // { day, kind }
  const [recipeForm, setRecipeForm] = uS(null); // null | { mode: 'new' } | { mode: 'edit', recipe }
  const [toast, setToast] = uS(null);
  const toastT = uRr(null);

  const showToast = (msg) => {
    setToast(msg);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 1900);
  };

  const recipeMap = uMm(() => Object.fromEntries(recipes.map(r => [r.id, r])), [recipes]);

  // ----- Plan handlers -----
  const handleAdd = (day, kind) => setAddSheet({ day, kind });
  const handleRemove = (day, kind) => {
    setPlan(p => ({ ...p, [day]: { ...p[day], [kind.toLowerCase()]: null }}));
    showToast("Meal removed");
  };
  const pickRecipe = (rid) => {
    if (!addSheet) return;
    const slot = addSheet.kind.toLowerCase();
    setPlan(p => ({ ...p, [addSheet.day]: { ...p[addSheet.day], [slot]: rid }}));
    setAddSheet(null);
    showToast(`Added to ${addSheet.day}`);
  };
  const pickCustom = (text) => {
    if (!addSheet) return;
    const slot = addSheet.kind.toLowerCase();
    setPlan(p => ({ ...p, [addSheet.day]: { ...p[addSheet.day], [slot]: { custom: text }}}));
    setAddSheet(null);
    showToast(`Added "${text}"`);
  };
  const swapMeals = (fromKey, toKey) => {
    const [fd, fs] = fromKey.split(".");
    const [td, ts] = toKey.split(".");
    setPlan(p => {
      const a = p[fd]?.[fs] ?? null;
      const b = p[td]?.[ts] ?? null;
      return {
        ...p,
        [fd]: { ...p[fd], [fs]: b },
        [td]: { ...p[td], [ts]: a },
      };
    });
    showToast("Meals swapped");
  };
  const copyToNextWeek = () => {
    showToast("Menu copied to next week");
  };

  // ----- Recipes -----
  const saveRecipe = (r) => {
    if (r.id) {
      setRecipes(rs => rs.map(x => x.id === r.id ? { ...x, ...r } : x));
      showToast("Recipe updated");
    } else {
      const id = "r" + Date.now();
      setRecipes(rs => [{ ...r, id }, ...rs]);
      showToast("Recipe created");
    }
    setRecipeForm(null);
  };
  const deleteRecipe = (id) => {
    setRecipes(rs => rs.filter(r => r.id !== id));
    // also clear from plan
    setPlan(p => {
      const next = { ...p };
      for (const d of DAY_KEYS) {
        for (const s of ["lunch","dinner"]) {
          if (next[d]?.[s] === id) next[d] = { ...next[d], [s]: null };
        }
      }
      return next;
    });
    showToast("Recipe deleted");
  };

  // ----- Shopping -----
  const shoppingItems = uMm(() => {
    return buildShopping(plan, recipeMap).filter(i => !shoppingHidden.has(i.name.toLowerCase()));
  }, [plan, recipeMap, shoppingHidden]);

  const toggleShop = (k) => {
    setShoppingChecked(prev => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  };
  const removeShop = (k) => {
    setShoppingHidden(prev => new Set([...prev, k]));
    showToast("Item removed");
  };

  // ----- Header (menu) -----
  const MenuHeader = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px 14px" }}>
      <div style={{
        width: 38, height: 38, borderRadius: "var(--r-md)",
        background: "var(--accent-soft)", color: "var(--accent-strong)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Ico name="chef" size={22} stroke={1.7}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)" }}>PlanEat</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          alex@example.com
        </div>
      </div>
      <button className="icon-btn pressable" onClick={() => { setAuthed(false); showToast("Signed out"); }} aria-label="Sign out">
        <Ico name="logout" size={18}/>
      </button>
    </div>
  );

  // ----- Render -----
  let screen;
  if (!authed) {
    screen = <LoginScreen onLogin={() => { setAuthed(true); showToast("Welcome back"); }}/>;
  } else if (recipeForm) {
    screen = <RecipeForm
      initial={recipeForm.recipe}
      onSave={saveRecipe}
      onCancel={() => setRecipeForm(null)}
    />;
  } else if (tab === "menu") {
    const MenuView = tweaks.menuLayout === "timeline" ? WeeklyMenuTimeline
                   : tweaks.menuLayout === "columns" ? WeeklyMenuColumns
                   : WeeklyMenuGrid;
    screen = (
      <div className="page">
        <MenuHeader/>
        <WeekHeader weekOffset={weekOffset} setWeekOffset={setWeekOffset} weekStart={tweaks.weekStart}/>
        <div className="scroll">
          <MenuView
            plan={plan}
            recipeMap={recipeMap}
            onAdd={handleAdd}
            onRemove={handleRemove}
            weekStart={tweaks.weekStart}
            onSwap={swapMeals}
          />
          <div style={{ padding: "0 16px 24px" }}>
            <button className="btn btn-soft pressable" onClick={copyToNextWeek}
              style={{ width: "100%", padding: "13px 0", fontSize: 14 }}>
              <Ico name="copy" size={15}/> Copy menu to next week
            </button>
          </div>
        </div>
      </div>
    );
  } else if (tab === "recipes") {
    screen = (
      <RecipesScreen
        recipes={recipes}
        onCreate={() => setRecipeForm({ mode: "new" })}
        onEdit={(r) => setRecipeForm({ mode: "edit", recipe: r })}
        onDelete={deleteRecipe}
      />
    );
  } else if (tab === "shopping") {
    screen = (
      <ShoppingScreen
        items={shoppingItems}
        checked={shoppingChecked}
        onToggle={toggleShop}
        onRemove={removeShop}
        onCopy={() => showToast("List copied to clipboard")}
        onSend={() => showToast("Sent to grocery app")}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        weekStart={tweaks.weekStart}
      />
    );
  } else if (tab === "household") {
    screen = (
      <HouseholdScreen
        household={household}
        members={members}
        onCreate={(name) => { setHousehold({ name }); showToast("Household created"); }}
        onInvite={(email) => {
          setMembers(m => [...m, { name: email.split("@")[0], email, role: "member", color: "oklch(0.65 0.14 250)" }]);
          showToast(`Invited ${email}`);
        }}
        onLeave={() => { setHousehold(null); setMembers([]); showToast("Left household"); }}
      />
    );
  }

  return (
    <div className="app-host">
      <div className="device" data-screen-label={!authed ? "Login" : tab}>
        <StatusBar/>
        {screen}
        {authed && !recipeForm && <BottomNav tab={tab} setTab={setTab}/>}
        <Toast msg={toast}/>
        <AddMealSheet
          open={!!addSheet}
          onClose={() => setAddSheet(null)}
          onPick={pickRecipe}
          onCustom={pickCustom}
          recipes={recipes}
          day={addSheet ? DAY_FULL[addSheet.day] : ""}
          kind={addSheet?.kind || ""}
        />
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Appearance">
          <TweakColor
            label="Accent"
            value={`oklch(0.68 0.16 ${tweaks.accentHue})`}
            onChange={() => {}}
            />
          <TweakSlider
            label="Hue" min={0} max={360} step={1}
            value={tweaks.accentHue}
            onChange={(v) => setTweak("accentHue", v)}
          />
          <TweakToggle label="Dark mode" value={tweaks.darkMode} onChange={(v) => setTweak("darkMode", v)}/>
          <TweakRadio
            label="Corner radius"
            options={[
              { value: "sharp", label: "Sharp" },
              { value: "soft",  label: "Soft" },
              { value: "round", label: "Round" },
            ]}
            value={tweaks.radius}
            onChange={(v) => setTweak("radius", v)}
          />
          <TweakRadio
            label="Density"
            options={[
              { value: "compact",  label: "Compact" },
              { value: "balanced", label: "Balanced" },
              { value: "airy",     label: "Airy" },
            ]}
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
          />
        </TweakSection>

        <TweakSection title="Behaviour">
          <TweakRadio
            label="Week starts on"
            options={[{ value: "mon", label: "Monday" }, { value: "sun", label: "Sunday" }]}
            value={tweaks.weekStart}
            onChange={(v) => setTweak("weekStart", v)}
          />
          <TweakRadio
            label="Bottom nav labels"
            options={[{ value: "show", label: "Show" }, { value: "hide", label: "Hide" }]}
            value={tweaks.navLabels}
            onChange={(v) => setTweak("navLabels", v)}
          />
        </TweakSection>

        <TweakSection title="Weekly menu layout">
          <TweakRadio
            label="Variant"
            options={[
              { value: "grid",     label: "Grid" },
              { value: "timeline", label: "Timeline" },
              { value: "columns",  label: "Columns" },
            ]}
            value={tweaks.menuLayout}
            onChange={(v) => { setTweak("menuLayout", v); if (tab !== "menu") setTab("menu"); }}
          />
        </TweakSection>

        <TweakSection title="Demo">
          <TweakButton label={authed ? "Sign out" : "Sign in"} onClick={() => setAuthed(a => !a)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
