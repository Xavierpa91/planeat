// Recipes, Shopping, Household screens + nav

const { useState: uS2, useEffect: uE2, useRef: uR2, useMemo: uM2 } = React;

// ============================================================
// RECIPES
// ============================================================
const RecipesScreen = ({ recipes, onCreate, onEdit, onDelete, accent }) => {
  return (
    <div className="page">
      <div style={{ padding: "8px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em" }}>Recipes</h1>
        <button className="btn btn-primary pressable" onClick={onCreate} style={{ padding: "10px 14px", fontSize: 14 }}>
          <Ico name="plus" size={16}/> New
        </button>
      </div>
      <div className="scroll" style={{ padding: "0 16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recipes.map(r => (
            <div key={r.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "var(--r-md)",
                  background: "var(--accent-soft)", color: "var(--accent-strong)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <FoodIco kind={r.icon} size={24}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em" }}>{r.name}</h3>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.45 }}>
                    {r.ingredients.join(" · ")}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-2)" }}>
                <button className="btn btn-outline pressable" onClick={() => onEdit(r)}
                  style={{ flex: 1, padding: "9px 0", fontSize: 13.5 }}>
                  <Ico name="edit" size={14}/> Edit
                </button>
                <button className="btn btn-outline pressable" onClick={() => onDelete(r.id)}
                  style={{ flex: 1, padding: "9px 0", fontSize: 13.5, color: "var(--danger)" }}>
                  <Ico name="trash" size={14}/> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RecipeForm = ({ initial, onSave, onCancel }) => {
  const [name, setName] = uS2(initial?.name || "");
  const [icon, setIcon] = uS2(initial?.icon || "bowl");
  const [ings, setIngs] = uS2(initial?.ingredients?.length ? [...initial.ingredients] : [""]);

  const addIng = () => setIngs([...ings, ""]);
  const setIng = (i, v) => setIngs(ings.map((x, j) => i === j ? v : x));
  const rmIng = (i) => setIngs(ings.filter((_, j) => j !== i));

  const ICONS = ["pasta","salad","chicken","fish","soup","bowl","pizza","wrap","rice","egg"];

  const valid = name.trim() && ings.some(i => i.trim());

  return (
    <div className="page">
      <div style={{ padding: "8px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <button className="icon-btn pressable" onClick={onCancel}><Ico name="left" size={18}/></button>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
          {initial ? "Edit recipe" : "New recipe"}
        </h1>
      </div>
      <div className="scroll" style={{ padding: "0 18px 100px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label className="label-tiny" style={{ display: "block", marginBottom: 6 }}>Name</label>
            <input className="input" placeholder="e.g. Pasta al Pomodoro" value={name} onChange={(e) => setName(e.target.value)} autoFocus/>
          </div>

          <div>
            <label className="label-tiny" style={{ display: "block", marginBottom: 8 }}>Icon</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {ICONS.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setIcon(k)}
                  className="pressable"
                  style={{
                    aspectRatio: "1", borderRadius: "var(--r-md)",
                    border: `1px solid ${icon === k ? "var(--accent)" : "var(--line)"}`,
                    background: icon === k ? "var(--accent-soft)" : "var(--surface)",
                    color: icon === k ? "var(--accent-ink)" : "var(--ink-2)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <FoodIco kind={k} size={22}/>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-tiny" style={{ display: "block", marginBottom: 8 }}>Ingredients</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ings.map((ing, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder={`Ingredient ${i+1}`} value={ing}
                    onChange={(e) => setIng(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addIng(); }
                    }}
                  />
                  <button type="button" className="icon-btn pressable" onClick={() => rmIng(i)}
                    disabled={ings.length === 1}
                    style={{ opacity: ings.length === 1 ? 0.4 : 1 }}>
                    <Ico name="x" size={16}/>
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-soft pressable" onClick={addIng}
                style={{ alignSelf: "flex-start", padding: "10px 14px", fontSize: 13.5 }}>
                <Ico name="plus" size={14}/> Add ingredient
              </button>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 80, padding: "12px 18px",
        background: "linear-gradient(180deg, transparent, var(--bg) 50%)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline pressable" onClick={onCancel} style={{ flex: 1, padding: "14px 0" }}>
            Cancel
          </button>
          <button className="btn btn-primary pressable"
            onClick={() => valid && onSave({
              id: initial?.id, name: name.trim(), icon,
              ingredients: ings.map(i => i.trim()).filter(Boolean),
            })}
            disabled={!valid}
            style={{ flex: 2, padding: "14px 0", opacity: valid ? 1 : 0.5 }}>
            Save recipe
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SHOPPING — with swipe-to-delete
// ============================================================
const SwipeRow = ({ children, onDelete }) => {
  const [dx, setDx] = uS2(0);
  const startX = uR2(null);
  const trackRef = uR2(null);

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchMove = (e) => {
    if (startX.current == null) return;
    const delta = e.touches[0].clientX - startX.current;
    setDx(Math.max(-110, Math.min(0, delta)));
  };
  const onTouchEnd = () => {
    setDx(dx < -50 ? -84 : 0);
    startX.current = null;
  };

  // mouse fallback for desktop preview
  const onMouseDown = (e) => { startX.current = e.clientX; };
  const onMouseMove = (e) => {
    if (startX.current == null) return;
    const delta = e.clientX - startX.current;
    setDx(Math.max(-110, Math.min(0, delta)));
  };
  const onMouseUp = () => {
    if (startX.current != null) {
      setDx(dx < -50 ? -84 : 0);
      startX.current = null;
    }
  };

  return (
    <div className="swipe-row">
      <div className="swipe-action pressable" onClick={onDelete}>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <Ico name="trash" size={16}/>
          Remove
        </span>
      </div>
      <div
        ref={trackRef}
        className="swipe-track"
        style={{ transform: `translateX(${dx}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {children}
      </div>
    </div>
  );
};

const ShoppingScreen = ({ items, checked, onToggle, onRemove, onCopy, onSend, weekOffset, setWeekOffset, weekStart }) => {
  const total = items.length;
  const done = items.filter(i => checked.has(i.name.toLowerCase())).length;

  return (
    <div className="page">
      <div style={{ padding: "8px 20px 6px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em" }}>Shopping</h1>
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        <WeekHeader weekOffset={weekOffset} setWeekOffset={setWeekOffset} weekStart={weekStart}/>
      </div>

      <div style={{ padding: "0 16px 12px" }}>
        <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "conic-gradient(var(--accent) " + (total ? Math.round((done/total)*360) : 0) + "deg, var(--line) 0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>
              {total ? Math.round((done/total)*100) : 0}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
              {done} of {total} completed
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              From {items.length ? "this week's planned meals" : "no meals yet"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
        <button className="btn btn-outline pressable" onClick={onCopy} style={{ flex: 1, padding: "11px 0", fontSize: 13.5 }}>
          <Ico name="copy" size={15}/> Copy list
        </button>
        <button className="btn btn-primary pressable" onClick={onSend} style={{ flex: 1, padding: "11px 0", fontSize: 13.5 }}>
          <Ico name="send" size={15}/> Send to grocery
        </button>
      </div>

      <div className="scroll" style={{ padding: "0 16px 24px" }}>
        {items.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px", color: "var(--muted)" }}>
            <div style={{ color: "var(--muted-2)" }}><EmptyIllustration kind="cart"/></div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginTop: 8 }}>Empty shopping list</h3>
            <p style={{ fontSize: 13.5, marginTop: 6, textAlign: "center", maxWidth: 280 }}>
              Plan some meals on your weekly menu and ingredients will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 6, overflow: "hidden" }}>
            {items.map((item, i) => {
              const k = item.name.toLowerCase();
              const isOn = checked.has(k);
              return (
                <div key={k} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                  <SwipeRow onDelete={() => onRemove(k)}>
                    <div
                      className="pressable"
                      onClick={() => onToggle(k)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", cursor: "pointer",
                        background: "var(--surface)",
                      }}>
                      <span className={`check ${isOn ? "on" : ""}`}>
                        {isOn && <Ico name="check" size={14} stroke={3}/>}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 15, fontWeight: 600,
                          color: isOn ? "var(--muted-2)" : "var(--ink)",
                          textDecoration: isOn ? "line-through" : "none",
                          textTransform: "capitalize",
                        }}>
                          {item.name}{item.n > 1 ? ` ×${item.n}` : ""}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {[...new Set(item.recipes)].join(" · ")}
                        </div>
                      </div>
                    </div>
                  </SwipeRow>
                </div>
              );
            })}
          </div>
        )}
        {items.length > 0 && (
          <p style={{ fontSize: 11.5, color: "var(--muted-2)", textAlign: "center", marginTop: 14 }}>
            Tip · swipe left on any item to remove it.
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// HOUSEHOLD
// ============================================================
const HouseholdScreen = ({ household, onCreate, onInvite, onLeave, members }) => {
  const [name, setName] = uS2("");
  const [email, setEmail] = uS2("");

  if (!household) {
    return (
      <div className="page">
        <div style={{ padding: "8px 20px 14px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em" }}>Household</h1>
        </div>
        <div className="scroll" style={{ padding: "0 24px 30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
          <div style={{ marginTop: 24, color: "var(--muted-2)" }}><EmptyIllustration kind="house"/></div>
          <div style={{
            width: 64, height: 64, borderRadius: "var(--r-lg)",
            background: "var(--accent-soft)", color: "var(--accent-strong)",
            display: "flex", alignItems: "center", justifyContent: "center", marginTop: -10,
          }}>
            <Ico name="home" size={32} stroke={1.7}/>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginTop: 16, textAlign: "center", letterSpacing: "-0.02em" }}>
            Cook together
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8, textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
            Create a household to share menus, recipes and shopping lists with the people you live with.
          </p>
          <div style={{ width: "100%", marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="Household name" value={name} onChange={(e) => setName(e.target.value)}/>
            <button
              className="btn btn-primary pressable"
              onClick={() => name.trim() && onCreate(name.trim())}
              disabled={!name.trim()}
              style={{ padding: "14px", opacity: name.trim() ? 1 : 0.5 }}
            >
              Create household
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ padding: "8px 20px 14px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em" }}>Household</h1>
      </div>
      <div className="scroll" style={{ padding: "0 16px 30px" }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "var(--r-md)",
              background: "var(--accent-soft)", color: "var(--accent-strong)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ico name="home" size={24} stroke={1.7}/>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em" }}>{household.name}</h2>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{members.length} member{members.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="label-tiny" style={{ padding: "0 4px 8px" }}>Members</div>
          <div className="card" style={{ padding: 6 }}>
            {members.map((m, i) => (
              <div key={m.email} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderBottom: i < members.length - 1 ? "1px solid var(--line-2)" : "none",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: m.color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                }}>
                  {m.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                    {m.name}{m.you ? " · You" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{m.email}</div>
                </div>
                {m.role === "owner" && (
                  <span className="label-tiny" style={{ color: "var(--accent-ink)", background: "var(--accent-soft)", padding: "3px 8px", borderRadius: "var(--r-pill)" }}>
                    Owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="label-tiny" style={{ padding: "0 4px 8px" }}>Invite by email</div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="name@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && email.trim()) { onInvite(email.trim()); setEmail(""); }}}
              />
              <button
                className="btn btn-primary pressable"
                onClick={() => { if (email.trim()) { onInvite(email.trim()); setEmail(""); }}}
                disabled={!email.trim()}
                style={{ opacity: email.trim() ? 1 : 0.5 }}
              >
                Invite
              </button>
            </div>
          </div>
        </div>

        <button className="btn btn-outline pressable" onClick={onLeave}
          style={{ width: "100%", marginTop: 22, padding: "14px", color: "var(--danger)", borderColor: "var(--line)" }}>
          Leave household
        </button>
      </div>
    </div>
  );
};

// ============================================================
// BOTTOM NAV
// ============================================================
const BottomNav = ({ tab, setTab }) => {
  const tabs = [
    { k: "menu", l: "Menu", ic: "calendar" },
    { k: "recipes", l: "Recipes", ic: "chef" },
    { k: "shopping", l: "Shopping", ic: "cart" },
    { k: "household", l: "Family", ic: "users" },
  ];
  return (
    <nav style={{
      position: "relative",
      flexShrink: 0,
      padding: "6px 8px calc(env(safe-area-inset-bottom, 12px) + 12px)",
      background: "var(--surface)",
      borderTop: "1px solid var(--line)",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 4,
    }}>
      {tabs.map(t => {
        const active = tab === t.k;
        return (
          <button
            key={t.k}
            className="nav-tab pressable"
            onClick={() => setTab(t.k)}
            style={{
              background: "transparent", border: 0, cursor: "pointer",
              padding: "8px 6px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              color: active ? "var(--accent-strong)" : "var(--muted)",
              borderRadius: "var(--r-md)",
              transition: "color 120ms ease",
            }}
          >
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "4px 14px", borderRadius: "var(--r-pill)",
              background: active ? "var(--accent-soft)" : "transparent",
              transition: "background 160ms ease",
            }}>
              <Ico name={t.ic} size={20} stroke={active ? 2.2 : 1.8}/>
            </span>
            <span className="nav-label" style={{ fontSize: 10.5, fontWeight: 600 }}>{t.l}</span>
          </button>
        );
      })}
    </nav>
  );
};

Object.assign(window, {
  RecipesScreen, RecipeForm,
  ShoppingScreen, SwipeRow,
  HouseholdScreen,
  BottomNav,
});
