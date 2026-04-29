// PlanEat screens: Login, Weekly Menu (3 layout variants), Recipes, Shopping, Household
// Plus: AddMealSheet, EmptyState, Toast

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- StatusBar ----------
const StatusBar = () => (
  <div className="status-bar">
    <span className="tabular">9:41</span>
    <div className="right">
      <svg width="18" height="11" viewBox="0 0 18 11"><g fill="currentColor"><rect x="0" y="6" width="3" height="5" rx=".5"/><rect x="5" y="3.5" width="3" height="7.5" rx=".5"/><rect x="10" y="1.5" width="3" height="9.5" rx=".5"/><rect x="15" y="0" width="3" height="11" rx=".5"/></g></svg>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M1 4.5C3 2 6 1 8 1s5 1 7 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M3 6.5C4.5 5 6 4.5 8 4.5s3.5.5 5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="9" r="1.2" fill="currentColor"/></svg>
      <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="17" height="8" rx="1.2" fill="currentColor"/><rect x="23" y="4" width="2" height="4" rx=".5" fill="currentColor" opacity=".5"/></svg>
    </div>
  </div>
);

// ---------- Toast ----------
const Toast = ({ msg }) => msg ? (
  <div className="toast-wrap">
    <div className="toast">
      <Ico name="check" size={16}/>
      <span>{msg}</span>
    </div>
  </div>
) : null;

// ---------- Empty State illustration ----------
const EmptyIllustration = ({ kind = "plate" }) => (
  <svg width="160" height="120" viewBox="0 0 160 120" fill="none" style={{ display: "block" }}>
    <defs>
      <pattern id="dot" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".25"/>
      </pattern>
    </defs>
    {kind === "plate" && (
      <>
        <ellipse cx="80" cy="76" rx="56" ry="14" fill="url(#dot)"/>
        <circle cx="80" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".7"/>
        <circle cx="80" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".4"/>
        <path d="M62 56l8-8M70 50l-3-2M98 56l-8-8M90 50l3-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".5"/>
      </>
    )}
    {kind === "cart" && (
      <>
        <ellipse cx="80" cy="100" rx="56" ry="8" fill="url(#dot)"/>
        <path d="M40 36h12l8 38h44l8-26H58" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="68" cy="86" r="4" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <circle cx="100" cy="86" r="4" stroke="currentColor" strokeWidth="1.6" fill="none"/>
      </>
    )}
    {kind === "house" && (
      <>
        <ellipse cx="80" cy="100" rx="48" ry="6" fill="url(#dot)"/>
        <path d="M48 60l32-26 32 26v34a4 4 0 0 1-4 4H52a4 4 0 0 1-4-4Z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <path d="M70 98v-22h20v22" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <circle cx="80" cy="58" r="2" fill="currentColor"/>
      </>
    )}
  </svg>
);

// ============================================================
// LOGIN
// ============================================================
const LoginScreen = ({ onLogin, accent }) => {
  return (
    <div className="page" style={{ padding: "0 28px", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, marginTop: "12vh" }}>
        <div style={{
          width: 88, height: 88, borderRadius: "var(--r-xl)",
          background: "var(--accent-soft)", color: "var(--accent-strong)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--shadow-2)",
        }}>
          <Ico name="chef" size={44} stroke={1.7}/>
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)" }}>
            PlanEat
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 8 }}>
            Plan your weekly meals.
          </p>
        </div>

        {/* original feature pillars (no filler — just the value prop) */}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {[
            { ic: "calendar", t: "Plan" },
            { ic: "cart", t: "Shop" },
            { ic: "users", t: "Share" },
          ].map(p => (
            <div key={p.t} style={{
              flex: 1, padding: "12px 8px", textAlign: "center",
              background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: "var(--r-md)", color: "var(--muted)", fontSize: 12, fontWeight: 600,
              display: "flex", flexDirection: "column", gap: 6, alignItems: "center",
            }}>
              <Ico name={p.ic} size={18} stroke={1.7}/>
              {p.t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: "0 0 28px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          className="btn pressable"
          onClick={onLogin}
          style={{
            background: "var(--surface)", color: "var(--ink)",
            border: "1px solid var(--line)", padding: "16px",
            fontSize: 15, fontWeight: 600, boxShadow: "var(--shadow-1)",
          }}
        >
          <Ico name="google" size={20}/>
          Continue with Google
        </button>
        <button
          className="btn btn-primary pressable"
          onClick={onLogin}
          style={{ padding: "16px", fontSize: 15 }}
        >
          <Ico name="mail" size={18} stroke={2}/>
          Continue with email
        </button>
        <p style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 12, marginTop: 10 }}>
          By continuing you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
};

// ============================================================
// WEEKLY MENU — variant A: Card grid (default, per spec)
// ============================================================
const MealSlot = ({ slot, value, recipeMap, onAdd, onRemove, draggable, onDragStart, onDragOver, onDrop, dragKey, dragOverKey }) => {
  const r = (typeof value === "string") ? recipeMap[value] : null;
  const custom = (value && typeof value === "object" && value.custom) ? value.custom : null;
  const filled = !!(r || custom);
  const isDragging = dragKey === slot.dragId;
  const isOver = dragOverKey === slot.dragId;

  return (
    <div
      draggable={draggable && filled}
      onDragStart={() => filled && onDragStart && onDragStart(slot.dragId)}
      onDragOver={(e) => { if (filled || true) { e.preventDefault(); onDragOver && onDragOver(slot.dragId); }}}
      onDrop={() => onDrop && onDrop(slot.dragId)}
      style={{
        flex: 1,
        minHeight: 86,
        padding: "10px 11px",
        background: filled ? "var(--accent-soft)" : "var(--surface-2)",
        border: `1px dashed ${filled ? "transparent" : "var(--line)"}`,
        borderRadius: "var(--r-md)",
        display: "flex", flexDirection: "column", gap: 6,
        position: "relative",
        cursor: filled ? "grab" : "pointer",
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isOver ? "inset 0 0 0 2px var(--accent)" : "none",
        transition: "box-shadow 120ms ease, opacity 120ms ease",
      }}
      onClick={() => !filled && onAdd(slot.day, slot.kind)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="label-tiny" style={{ color: filled ? "var(--accent-ink)" : "var(--muted)" }}>
          {slot.kind}
        </span>
        {filled && (
          <button
            className="icon-btn ghost pressable"
            onClick={(e) => { e.stopPropagation(); onRemove(slot.day, slot.kind); }}
            style={{ width: 22, height: 22, color: "var(--accent-ink)" }}
            aria-label="Remove meal"
          >
            <Ico name="x" size={14}/>
          </button>
        )}
      </div>
      {r && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-ink)" }}>
          <FoodIco kind={r.icon} size={20}/>
          <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>{r.name}</span>
        </div>
      )}
      {custom && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-ink)" }}>
          <Ico name="spark" size={18} stroke={1.7}/>
          <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>{custom}</span>
        </div>
      )}
      {!filled && (
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--muted-2)" }}>
          <Ico name="plus" size={14}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Add</span>
        </div>
      )}
    </div>
  );
};

const WeekHeader = ({ weekOffset, setWeekOffset, weekStart }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 16px 14px",
  }}>
    <button className="icon-btn pressable" onClick={() => setWeekOffset(weekOffset - 1)} aria-label="Previous week">
      <Ico name="left" size={18}/>
    </button>
    <button
      onClick={() => setWeekOffset(0)}
      style={{
        background: "transparent", border: 0, color: "var(--ink)", fontSize: 15, fontWeight: 700,
        display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", padding: 0,
      }}
    >
      <span className="tabular" style={{ letterSpacing: "-0.01em" }}>
        {fmtRange(weekOffset, weekStart)}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
        {weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : weekOffset > 0 ? `+${weekOffset} weeks` : `${weekOffset} weeks`}
      </span>
    </button>
    <button className="icon-btn pressable" onClick={() => setWeekOffset(weekOffset + 1)} aria-label="Next week">
      <Ico name="right" size={18}/>
    </button>
  </div>
);

const WeeklyMenuGrid = ({ plan, recipeMap, onAdd, onRemove, weekStart, onSwap }) => {
  const days = orderedDays(weekStart);
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);

  const handleDrop = (toKey) => {
    if (dragKey && dragKey !== toKey) onSwap(dragKey, toKey);
    setDragKey(null); setOverKey(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 16px 18px" }}>
      {days.map(day => {
        const dayPlan = plan[day] || {};
        return (
          <div key={day} className="card" style={{ padding: "12px 12px 12px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px 10px" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{DAY_FULL[day]}</span>
              <span className="label-tiny" style={{ fontSize: 9.5 }}>{day.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["lunch","dinner"].map(slot => (
                <MealSlot
                  key={slot}
                  slot={{ day, kind: slot.toUpperCase(), dragId: `${day}.${slot}` }}
                  value={dayPlan[slot]}
                  recipeMap={recipeMap}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  draggable
                  dragKey={dragKey}
                  dragOverKey={overKey}
                  onDragStart={setDragKey}
                  onDragOver={setOverKey}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Variant B: Timeline / agenda ----------
const WeeklyMenuTimeline = ({ plan, recipeMap, onAdd, onRemove, weekStart }) => {
  const days = orderedDays(weekStart);
  return (
    <div style={{ padding: "0 16px 18px" }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-1)",
      }}>
        {days.map((day, i) => {
          const dayPlan = plan[day] || {};
          return (
            <div key={day} style={{
              display: "grid", gridTemplateColumns: "56px 1fr",
              borderBottom: i < days.length - 1 ? "1px solid var(--line-2)" : "none",
              padding: "12px 14px",
              alignItems: "stretch",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: ".1em" }}>
                  {day.toUpperCase()}
                </span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", marginTop: 2 }}>
                  {28 + (i % 7)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["lunch","dinner"].map(slot => {
                  const v = dayPlan[slot];
                  const r = typeof v === "string" ? recipeMap[v] : null;
                  const custom = (v && typeof v === "object" && v.custom) ? v.custom : null;
                  const filled = !!(r || custom);
                  return (
                    <div key={slot}
                      onClick={() => !filled && onAdd(day, slot.toUpperCase())}
                      className="pressable"
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                        background: filled ? "var(--accent-soft)" : "var(--surface-2)",
                        borderRadius: "var(--r-md)",
                        border: filled ? "1px solid transparent" : "1px dashed var(--line)",
                        cursor: filled ? "default" : "pointer",
                      }}>
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, letterSpacing: ".12em",
                        color: filled ? "var(--accent-ink)" : "var(--muted)",
                        width: 36, textTransform: "uppercase",
                      }}>{slot}</span>
                      {r && <FoodIco kind={r.icon} size={16}/>}
                      {(r || custom) ? (
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--accent-ink)", flex: 1 }}>
                          {r ? r.name : custom}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--muted-2)", flex: 1, fontWeight: 500 }}>
                          + Add meal
                        </span>
                      )}
                      {filled && (
                        <button className="icon-btn ghost pressable" onClick={(e) => { e.stopPropagation(); onRemove(day, slot.toUpperCase()); }}
                          style={{ width: 22, height: 22, color: "var(--accent-ink)" }}>
                          <Ico name="x" size={14}/>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Variant C: Two-column compact ----------
const WeeklyMenuColumns = ({ plan, recipeMap, onAdd, onRemove, weekStart }) => {
  const days = orderedDays(weekStart);
  const Cell = ({ day, slot }) => {
    const dayPlan = plan[day] || {};
    const v = dayPlan[slot];
    const r = typeof v === "string" ? recipeMap[v] : null;
    const custom = (v && typeof v === "object" && v.custom) ? v.custom : null;
    const filled = !!(r || custom);
    return (
      <div
        className="pressable"
        onClick={() => !filled && onAdd(day, slot.toUpperCase())}
        style={{
          padding: "10px 11px",
          background: filled ? "var(--accent-soft)" : "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--line-2)",
          minHeight: 64, display: "flex", flexDirection: "column", gap: 4,
          cursor: filled ? "default" : "pointer",
          position: "relative",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {r && <FoodIco kind={r.icon} size={14}/>}
          {filled ? (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent-ink)", lineHeight: 1.2 }}>
              {r ? r.name : custom}
            </span>
          ) : (
            <span style={{ fontSize: 12.5, color: "var(--muted-2)", fontWeight: 500 }}>+ Add</span>
          )}
        </div>
        {filled && (
          <button onClick={(e) => { e.stopPropagation(); onRemove(day, slot.toUpperCase()); }}
            className="icon-btn ghost pressable"
            style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, color: "var(--accent-ink)" }}>
            <Ico name="x" size={12}/>
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "0 16px 18px" }}>
      <div className="card" style={{ padding: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, alignItems: "center", paddingBottom: 8, borderBottom: "1px solid var(--line-2)" }}>
          <span/>
          <span className="label-tiny" style={{ textAlign: "center" }}>Lunch</span>
          <span className="label-tiny" style={{ textAlign: "center" }}>Dinner</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
          {days.map(day => (
            <div key={day} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, alignItems: "stretch" }}>
              <div style={{ display: "flex", alignItems: "center", color: "var(--ink)", fontSize: 13, fontWeight: 700 }}>
                {day}
              </div>
              <Cell day={day} slot="lunch"/>
              <Cell day={day} slot="dinner"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Add Meal Sheet ----------
const AddMealSheet = ({ open, onClose, onPick, onCustom, recipes, day, kind }) => {
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");
  useEffect(() => { if (open) { setQ(""); setCustom(""); } }, [open]);
  const filtered = useMemo(() => {
    if (!q.trim()) return recipes;
    const s = q.toLowerCase();
    return recipes.filter(r => r.name.toLowerCase().includes(s) || r.ingredients.some(i => i.toLowerCase().includes(s)));
  }, [q, recipes]);

  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}/>
      <div className="sheet">
        <div className="sheet-handle"/>
        <div style={{ padding: "8px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="label-tiny">{day} · {kind}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 2, letterSpacing: "-0.01em" }}>Pick a recipe</h3>
          </div>
          <button className="icon-btn pressable" onClick={onClose} aria-label="Close"><Ico name="x" size={18}/></button>
        </div>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }}>
              <Ico name="search" size={16}/>
            </span>
            <input
              className="input"
              placeholder="Search recipes or ingredients"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: 38 }}
              autoFocus
            />
          </div>
        </div>
        <div className="scroll" style={{ padding: "0 12px 16px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "20px 12px", color: "var(--muted)", fontSize: 14, textAlign: "center" }}>
              No recipes match "{q}".
            </div>
          )}
          {filtered.map(r => (
            <button
              key={r.id}
              className="pressable"
              onClick={() => onPick(r.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px", width: "100%", textAlign: "left",
                background: "transparent", border: 0, borderRadius: "var(--r-md)",
                cursor: "pointer", color: "inherit",
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: "var(--r-md)",
                background: "var(--accent-soft)", color: "var(--accent-strong)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <FoodIco kind={r.icon} size={22}/>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{r.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.ingredients.slice(0, 4).join(" · ")}{r.ingredients.length > 4 ? " · …" : ""}
                </div>
              </div>
              <Ico name="plus" size={18}/>
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 18px 22px", borderTop: "1px solid var(--line-2)", background: "var(--surface)" }}>
          <div className="label-tiny" style={{ marginBottom: 6 }}>Or add a custom meal</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="e.g. Leftovers night"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) onCustom(custom.trim()); }}
            />
            <button
              className="btn btn-primary pressable"
              onClick={() => custom.trim() && onCustom(custom.trim())}
              disabled={!custom.trim()}
              style={{ opacity: custom.trim() ? 1 : 0.5 }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, {
  StatusBar, Toast, EmptyIllustration,
  LoginScreen,
  WeekHeader, WeeklyMenuGrid, WeeklyMenuTimeline, WeeklyMenuColumns,
  AddMealSheet,
});
