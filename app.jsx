import { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, Plus, Target, FolderOpen, Sparkles, Heart, Users,
  CheckCircle2, Circle, X, Send, RefreshCw, ArrowRight
} from "lucide-react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:        "#08090f",
  surface:   "#0f1119",
  elevated:  "#151a26",
  card:      "rgba(255,255,255,0.032)",
  cardHov:   "rgba(255,255,255,0.056)",
  border:    "rgba(255,255,255,0.07)",
  borderMd:  "rgba(255,255,255,0.12)",
  accent:    "#87a89a",
  accentBg:  "rgba(135,168,154,0.12)",
  accentBd:  "rgba(135,168,154,0.25)",
  warm:      "#c5a06b",
  warmBg:    "rgba(197,160,107,0.12)",
  warmBd:    "rgba(197,160,107,0.25)",
  lav:       "#9d8ec4",
  lavBg:     "rgba(157,142,196,0.12)",
  blue:      "#7aafc5",
  blueBg:    "rgba(122,175,197,0.12)",
  text:      "#ddd8ce",
  sub:       "#8d95a4",
  muted:     "#48505e",
  display:   '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  body:      '"DM Sans", system-ui, -apple-system, sans-serif',
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  textarea, input, button { font-family: "DM Sans", system-ui, sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40%           { transform: translateY(-4px); opacity: 1; }
  }
  .view-enter { animation: fadeUp 0.38s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-in    { animation: fadeIn 0.25s ease both; }
  .dot1, .dot2, .dot3 {
    display: inline-block; width: 5px; height: 5px; border-radius: 50%;
    background: ${T.accent}; animation: dotBounce 1.3s infinite ease-in-out;
  }
  .dot2 { animation-delay: 0.18s; }
  .dot3 { animation-delay: 0.36s; }
  .nav-btn:hover  { background: rgba(255,255,255,0.05) !important; }
  .card-hov:hover { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.11) !important; }
  .btn-accent:hover { opacity: 0.88; }
  .pill-btn:hover { background: rgba(255,255,255,0.07) !important; }
  .tag-btn { transition: all 0.15s; }
  .tag-btn:hover { border-color: ${T.accentBd} !important; color: ${T.accent} !important; }
  input[type=range] { -webkit-appearance: none; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.08); outline: none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${T.accent}; cursor: pointer; border: 2px solid ${T.bg}; }
`;

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const SEED_CAPTURES = [
  { id: 1, text: "Build the AI prioritization logic — should feel like a calm advisor, not a task scheduler", category: "🗂 Project", time: "2h ago", bg: T.lavBg },
  { id: 2, text: "Reply to Priya about the freelance proposal she sent over", category: "👥 People", time: "yesterday", bg: T.warmBg },
  { id: 3, text: "I feel scattered today — too many open loops pulling attention in different directions", category: "😌 Emotion", time: "this morning", bg: T.accentBg },
  { id: 4, text: "Research cold exposure protocols for workout recovery", category: "🏃 Health", time: "2 days ago", bg: T.blueBg },
  { id: 5, text: "The second-brain note architecture needs a rethink — connection layer is missing", category: "💡 Idea", time: "3 days ago", bg: T.lavBg },
];
const SEED_PROJECTS = [
  { id: 1, name: "Personal OS App", tag: "Building", next: "Design the reflection view wireframe", progress: 60, status: "active" },
  { id: 2, name: "Freelance Client Work", tag: "Revenue", next: "Send revised proposal to Priya", progress: 30, status: "active" },
  { id: 3, name: "Health Reset Protocol", tag: "Wellbeing", next: "Book blood work appointment", progress: 15, status: "paused" },
];
const SEED_PEOPLE = [
  { id: 1, name: "Priya", role: "Colleague", last: "3 days ago", note: "Needs reply on freelance proposal", emoji: "👩", urgency: "high" },
  { id: 2, name: "Mom", role: "Family", last: "1 week ago", note: "Call this weekend — she mentioned she wanted to talk", emoji: "👩‍🦳", urgency: "medium" },
  { id: 3, name: "Arjun", role: "Friend", last: "2 weeks ago", note: "Catch up — it's been a while", emoji: "👨", urgency: "low" },
  { id: 4, name: "Rahul", role: "Network", last: "1 month ago", note: "Follow up on the intro he offered to make", emoji: "👨‍💼", urgency: "low" },
];
const MANTRAS = [
  "one thing done well beats five things half-done.",
  "rest is not the opposite of progress.",
  "clarity is a form of self-care.",
  "you can return anytime — nothing is lost.",
  "slow and consistent beats fast and chaotic.",
  "the goal is orientation, not perfection.",
];
const CAT_OPTIONS = ["💭 Thought","💡 Idea","🗂 Project","👥 People","💰 Finance","🏃 Health","😌 Emotion","🔄 Open Loop","🎯 Goal","📅 Schedule"];
const NAV = [
  { id: "today",    Icon: Home,       label: "Today" },
  { id: "capture",  Icon: Plus,       label: "Capture" },
  { id: "focus",    Icon: Target,     label: "Focus" },
  { id: "projects", Icon: FolderOpen, label: "Projects" },
  { id: "reflect",  Icon: Sparkles,   label: "Reflect" },
  { id: "people",   Icon: Users,      label: "People" },
  { id: "health",   Icon: Heart,      label: "Health" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return { hi: "Still up?",      sub: "It's late. What's pulling at you?" };
  if (h < 12) return { hi: "Good morning.",  sub: "Let's start gently today." };
  if (h < 17) return { hi: "Good afternoon.",sub: "How's the day unfolding?" };
  if (h < 21) return { hi: "Good evening.",  sub: "Winding down or still in flow?" };
  return             { hi: "Hey.",            sub: "What's on your mind tonight?" };
}

// ─── AI CALL ──────────────────────────────────────────────────────────────────
async function callAI(systemPrompt, userMsg, history = []) {
  const msgs = history.length
    ? [...history, { role: "user", content: userMsg }]
    : [{ role: "user", content: userMsg }];
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt, messages: msgs }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView]         = useState("today");
  const [captures, setCaptures] = useState(SEED_CAPTURES);
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [health, setHealth]     = useState({ mood: 3, energy: 3, sleep: 7, water: 3, workout: false, walk: false, meditate: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [mantra]                = useState(() => MANTRAS[Math.floor(Math.random() * MANTRAS.length)]);

  const addCapture = useCallback((text, category = "💭 Thought") => {
    setCaptures(p => [{ id: Date.now(), text, category, time: "just now", bg: T.accentBg }, ...p]);
  }, []);

  return (
    <div style={{ fontFamily: T.body, background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 214,
        background: T.surface, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", zIndex: 50,
      }}>
        <div style={{ padding: "26px 22px 22px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.display, fontSize: 24, color: T.text, letterSpacing: "-0.02em", lineHeight: 1 }}>Axis</div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Life Operating System</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV.map(({ id, Icon, label }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => setView(id)} className="nav-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8,
                  background: active ? T.accentBg : "transparent",
                  color: active ? T.accent : T.sub, fontSize: 13.5,
                  fontWeight: active ? 500 : 400, textAlign: "left", cursor: "pointer",
                  border: active ? `1px solid ${T.accentBd}` : "1px solid transparent",
                  transition: "all 0.18s",
                }}>
                <Icon size={15} strokeWidth={active ? 2 : 1.7} />
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 11, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>"{mantra}"</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, marginLeft: 214, minHeight: "100vh" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 36px 120px" }}>
          {view === "today"    && <TodayView captures={captures} health={health} setHealth={setHealth} onCapture={() => setModalOpen(true)} />}
          {view === "capture"  && <CaptureView captures={captures} addCapture={addCapture} setCaptures={setCaptures} />}
          {view === "focus"    && <FocusView captures={captures} projects={projects} />}
          {view === "projects" && <ProjectsView projects={projects} setProjects={setProjects} />}
          {view === "reflect"  && <ReflectView captures={captures} health={health} />}
          {view === "people"   && <PeopleView />}
          {view === "health"   && <HealthView health={health} setHealth={setHealth} />}
        </div>
      </main>

      {/* ── FAB ── */}
      <button onClick={() => setModalOpen(true)} className="btn-accent"
        style={{
          position: "fixed", bottom: 28, right: 28, width: 50, height: 50,
          borderRadius: "50%", background: T.accent, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 6px 28px rgba(135,168,154,0.35)`, zIndex: 200,
          transition: "opacity 0.2s",
        }}>
        <Plus size={20} color={T.bg} strokeWidth={2.5} />
      </button>

      {/* ── MODAL ── */}
      {modalOpen && (
        <QuickCapture onClose={() => setModalOpen(false)} onSave={(t, c) => { addCapture(t, c); setModalOpen(false); }} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function TodayView({ captures, health, setHealth, onCapture }) {
  const { hi, sub } = greeting();
  const [focus, setFocus]     = useState("");
  const [editFocus, setEdit]  = useState(false);
  const [tasks, setTasks]     = useState([
    { id: 1, text: "Reply to Priya's freelance proposal", done: false },
    { id: 2, text: "30 min deep work session on the app", done: true },
    { id: 3, text: "Drink 8 glasses of water", done: false },
  ]);
  const [newTask, setNewTask] = useState("");
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const moodRow = [["😔","Low"],["😕","Tired"],["😐","Okay"],["🙂","Good"],["😊","Great"]];
  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="view-enter">
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{date}</p>
        <h1 style={{ fontFamily: T.display, fontSize: 40, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.08, color: T.text, marginBottom: 6 }}>{hi}</h1>
        <p style={{ fontSize: 14, color: T.sub }}>{sub}</p>
      </div>

      {/* Mood Bar */}
      <Card mb={14}>
        <Label text="How are you feeling?" />
        <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
          {moodRow.map(([em, lb], i) => (
            <button key={i} onClick={() => setHealth(h => ({ ...h, mood: i + 1 }))}
              style={{
                flex: 1, padding: "10px 4px", borderRadius: 10, cursor: "pointer",
                background: health.mood === i + 1 ? T.accentBg : "rgba(255,255,255,0.03)",
                border: `1px solid ${health.mood === i + 1 ? T.accentBd : T.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.18s",
              }}>
              <span style={{ fontSize: 20 }}>{em}</span>
              <span style={{ fontSize: 9, color: health.mood === i + 1 ? T.accent : T.muted, letterSpacing: "0.05em" }}>{lb}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Today's Focus */}
      <Card mb={14} style={{ borderColor: T.accentBd + "60" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Label text="Today's single focus" color={T.accent} />
          <button onClick={() => setEdit(e => !e)}
            style={{ fontSize: 11, color: T.muted, background: "rgba(255,255,255,0.05)", padding: "2px 9px", borderRadius: 5, cursor: "pointer" }}>
            {editFocus ? "done" : "set"}
          </button>
        </div>
        {editFocus ? (
          <textarea autoFocus value={focus} onChange={e => setFocus(e.target.value)} onBlur={() => setEdit(false)}
            placeholder="What one thing would make today feel complete?"
            style={{
              width: "100%", background: "transparent", border: "none", color: T.text,
              fontFamily: T.display, fontSize: 17, fontStyle: "italic", lineHeight: 1.65,
              resize: "none", outline: "none",
            }} rows={2} />
        ) : focus ? (
          <p onClick={() => setEdit(true)} style={{ fontFamily: T.display, fontSize: 17, fontStyle: "italic", color: T.text, lineHeight: 1.65, cursor: "text" }}>"{focus}"</p>
        ) : (
          <p onClick={() => setEdit(true)} style={{ fontFamily: T.display, fontSize: 16, fontStyle: "italic", color: T.muted, lineHeight: 1.65, cursor: "text" }}>
            What one thing would make today feel complete?
          </p>
        )}
      </Card>

      {/* Tasks */}
      <Card mb={14}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Label text={`Tasks  ·  ${doneCount}/${tasks.length}`} />
          <span style={{ fontSize: 11, color: doneCount === tasks.length ? T.accent : T.muted }}>
            {doneCount === tasks.length && tasks.length > 0 ? "✓ all done" : `${tasks.length - doneCount} remaining`}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
              <button onClick={() => setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
                style={{ color: t.done ? T.accent : T.muted, cursor: "pointer", flexShrink: 0, lineHeight: 0 }}>
                {t.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <span style={{ flex: 1, fontSize: 13.5, color: t.done ? T.muted : T.text, textDecoration: t.done ? "line-through" : "none", lineHeight: 1.4 }}>{t.text}</span>
              <button onClick={() => setTasks(ts => ts.filter(x => x.id !== t.id))}
                style={{ color: T.muted, opacity: 0, cursor: "pointer", lineHeight: 0 }} className="del-btn">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <input value={newTask} onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newTask.trim()) { setTasks(ts => [...ts, { id: Date.now(), text: newTask, done: false }]); setNewTask(""); } }}
            placeholder="Add a task… (Enter to save)"
            style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontSize: 13, outline: "none" }} />
        </div>
      </Card>

      {/* Recent Captures */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Label text="Recent captures" />
          <span style={{ fontSize: 11, color: T.accent, cursor: "pointer" }}>view all →</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {captures.slice(0, 3).map(c => (
            <div key={c.id} className="card-hov" style={{ padding: "11px 14px", background: c.bg, borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", transition: "all 0.18s" }}>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.5, marginBottom: 6 }}>{c.text}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Pill text={c.category} />
                <span style={{ fontSize: 10, color: T.muted }}>{c.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onCapture} style={{
        width: "100%", marginTop: 10, padding: "13px",
        background: "transparent", border: `1px dashed ${T.accentBd}`,
        borderRadius: 11, color: T.accent, fontSize: 13, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        transition: "all 0.18s",
      }}>
        <Plus size={15} /> Capture a thought
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPTURE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function CaptureView({ captures, addCapture, setCaptures }) {
  const [text, setText]   = useState("");
  const [cat, setCat]     = useState("💭 Thought");
  const [aiCat, setAiCat] = useState("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const autoTag = useCallback(async (t) => {
    if (t.length < 12) return;
    setLoading(true);
    try {
      const result = await callAI(
        "You categorize short captures into one of these: 💭 Thought, 💡 Idea, 🗂 Project, 👥 People, 💰 Finance, 🏃 Health, 😌 Emotion, 🔄 Open Loop, 🎯 Goal, 📅 Schedule. Return ONLY the category label, nothing else.",
        `Capture: "${t}"`
      );
      setAiCat(result.trim());
    } catch {}
    setLoading(false);
  }, []);

  const handleChange = (val) => {
    setText(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => autoTag(val), 900);
  };

  const save = () => {
    if (!text.trim()) return;
    addCapture(text, aiCat || cat);
    setText(""); setAiCat(""); setCat("💭 Thought");
  };

  return (
    <div className="view-enter">
      <Header title="Capture" sub="Get it out of your head. No organization needed right now." />

      <Card mb={12}>
        <textarea value={text} onChange={e => handleChange(e.target.value)} autoFocus
          placeholder="What's on your mind? A thought, idea, task, fear, plan, business idea, anything at all…"
          style={{
            width: "100%", background: "transparent", border: "none", color: T.text,
            fontSize: 15.5, lineHeight: 1.7, resize: "none", outline: "none",
            fontFamily: T.body, minHeight: 110,
          }} rows={5} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading ? (
              <span style={{ display: "flex", gap: 3 }}><span className="dot1"/><span className="dot2"/><span className="dot3"/></span>
            ) : aiCat ? (
              <span style={{ fontSize: 12, color: T.accent, background: T.accentBg, padding: "3px 10px", borderRadius: 20, border: `1px solid ${T.accentBd}` }}>{aiCat} · AI</span>
            ) : (
              <span style={{ fontSize: 11, color: T.muted }}>AI will auto-tag as you type</span>
            )}
          </div>
          <button onClick={save} disabled={!text.trim()}
            style={{
              padding: "8px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: text.trim() ? T.accent : "rgba(255,255,255,0.05)",
              color: text.trim() ? T.bg : T.muted,
              cursor: text.trim() ? "pointer" : "default", transition: "all 0.2s",
            }}>
            Save →
          </button>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
        {CAT_OPTIONS.map(c => (
          <button key={c} onClick={() => { setCat(c); setAiCat(c); }} className="tag-btn"
            style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
              background: (aiCat || cat) === c ? T.accentBg : "rgba(255,255,255,0.04)",
              border: `1px solid ${(aiCat || cat) === c ? T.accentBd : T.border}`,
              color: (aiCat || cat) === c ? T.accent : T.sub,
            }}>{c}
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
          <Label text={`All captures  ·  ${captures.length}`} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {captures.map(c => (
            <div key={c.id} className="card-hov" style={{
              padding: "12px 14px", background: T.card, borderRadius: 10,
              border: `1px solid ${T.border}`, display: "flex", gap: 12, transition: "all 0.18s",
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5, marginBottom: 6 }}>{c.text}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Pill text={c.category} />
                  <span style={{ fontSize: 10, color: T.muted }}>{c.time}</span>
                </div>
              </div>
              <button onClick={() => setCaptures(cs => cs.filter(x => x.id !== c.id))}
                style={{ color: T.muted, cursor: "pointer", opacity: 0.5, lineHeight: 0, alignSelf: "flex-start", marginTop: 2 }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOCUS VIEW — AI Advisor
// ═══════════════════════════════════════════════════════════════════════════════
function FocusView({ captures, projects }) {
  const SYSTEM = `You are Axis — a calm, grounded AI life advisor embedded in a personal operating system. The user has nonlinear thinking, ADHD-like executive dysfunction, and often feels overwhelmed by too many open loops.

Your role: help them identify what truly matters right now, challenge overcommitment gently, and support clear execution without pressure.

Tone: direct, warm, non-judgmental. No hustle culture. No toxic positivity. No guilt or shame. Responses are SHORT (2–4 sentences max). Be real, not motivational-poster-y. Like a calm friend who happens to be exceptionally clear-headed.

User context:
- Recent captures: ${captures.slice(0,4).map(c => c.text).join(" | ")}
- Active projects: ${projects.filter(p => p.status === "active").map(p => p.name).join(", ")}`;

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey. What's pulling at you most right now? Let's figure out what actually matters today — not everything, just the one real thing." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput("");
    const updated = [...messages, { role: "user", text: userText }];
    setMessages(updated);
    setLoading(true);
    try {
      const history = updated.map(m => ({ role: m.role, content: m.text }));
      const reply = await callAI(SYSTEM, userText, history.slice(0, -1));
      setMessages([...updated, { role: "assistant", text: reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", text: "Something went wrong on my end. Take a breath — I'm still here." }]);
    }
    setLoading(false);
  };

  const PROMPTS = [
    "What should I actually focus on today?",
    "I feel overwhelmed. Help me simplify.",
    "What am I probably avoiding and why?",
    "Which of my projects should I pause?",
    "What's the single most important next action?",
  ];

  return (
    <div className="view-enter">
      <Header title="Focus" sub="Your calm AI advisor. Direct, honest, no judgment." />

      <Card mb={16} style={{ padding: 0 }}>
        <div style={{ padding: "16px 18px", maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
              {m.role === "assistant" && (
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.accentBg, border: `1px solid ${T.accentBd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Sparkles size={12} color={T.accent} />
                </div>
              )}
              <div style={{
                maxWidth: "80%", padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6, color: T.text,
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                background: m.role === "user" ? T.accentBg : T.card,
                border: `1px solid ${m.role === "user" ? T.accentBd : T.border}`,
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.accentBg, border: `1px solid ${T.accentBd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={12} color={T.accent} />
              </div>
              <span style={{ display: "flex", gap: 3 }}><span className="dot1"/><span className="dot2"/><span className="dot3"/></span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 9, alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="What's on your mind? (Enter to send)"
            style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontSize: 13.5, resize: "none", outline: "none", lineHeight: 1.5, fontFamily: T.body, maxHeight: 90 }} rows={1} />
          <button onClick={send} disabled={!input.trim() || loading}
            style={{
              width: 32, height: 32, borderRadius: 7, cursor: input.trim() ? "pointer" : "default",
              background: input.trim() ? T.accent : "rgba(255,255,255,0.06)",
              color: input.trim() ? T.bg : T.muted,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
            }}>
            <Send size={13} />
          </button>
        </div>
      </Card>

      <div>
        <Label text="Quick prompts" style={{ marginBottom: 10, display: "block" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {PROMPTS.map(p => (
            <button key={p} onClick={() => setInput(p)} className="card-hov"
              style={{
                textAlign: "left", padding: "10px 14px", background: T.card,
                border: `1px solid ${T.border}`, borderRadius: 10, color: T.sub,
                fontSize: 13, cursor: "pointer", transition: "all 0.18s",
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsView({ projects, setProjects }) {
  const [expanded, setExpanded] = useState(null);
  const activeCount = projects.filter(p => p.status === "active").length;

  return (
    <div className="view-enter">
      <Header title="Projects" sub="Simple. One clear next step per project. Nothing more." />

      {activeCount > 2 && (
        <div style={{ padding: "12px 14px", background: T.warmBg, border: `1px solid ${T.warmBd}`, borderRadius: 10, marginBottom: 20, fontSize: 13, color: T.warm, lineHeight: 1.5 }}>
          <strong>⚠ Overload notice.</strong> You have {activeCount} active projects. Scattered focus reduces everything. Consider pausing one or two.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {projects.map(p => {
          const open = expanded === p.id;
          return (
            <div key={p.id} className="card-hov"
              style={{
                padding: "16px 18px", background: open ? T.accentBg : T.card,
                border: `1px solid ${open ? T.accentBd : T.border}`,
                borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
              }}
              onClick={() => setExpanded(open ? null : p.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14.5, fontWeight: 500, color: T.text }}>{p.name}</span>
                    <StatusBadge status={p.status} />
                    <span style={{ fontSize: 10, color: T.muted, background: "rgba(255,255,255,0.05)", padding: "1px 7px", borderRadius: 20 }}>{p.tag}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: T.sub }}>
                    Next: <span style={{ color: T.warm }}>{p.next}</span>
                  </p>
                </div>
                <div style={{ textAlign: "right", marginLeft: 16, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 5 }}>{p.progress}%</div>
                  <div style={{ width: 56, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                    <div style={{ width: `${p.progress}%`, height: "100%", background: T.accent, borderRadius: 2, transition: "width 0.4s" }} />
                  </div>
                </div>
              </div>
              {open && (
                <div className="fade-in" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid rgba(255,255,255,0.08)`, display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setProjects(ps => ps.map(x => x.id === p.id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x))}
                    style={{ fontSize: 12, padding: "5px 13px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: T.sub, cursor: "pointer" }}>
                    {p.status === "active" ? "⏸ Pause" : "▶ Resume"}
                  </button>
                  <button onClick={() => setProjects(ps => ps.filter(x => x.id !== p.id))}
                    style={{ fontSize: 12, padding: "5px 13px", borderRadius: 6, background: "rgba(224,112,112,0.1)", color: "#e07070", cursor: "pointer" }}>
                    Archive
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => setProjects(ps => [...ps, { id: Date.now(), name: "New Project", tag: "Idea", next: "Define the first step", progress: 0, status: "active" }])}
        style={{
          width: "100%", marginTop: 12, padding: "12px",
          background: "transparent", border: `1px dashed ${T.border}`,
          borderRadius: 10, color: T.muted, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
        <Plus size={14} /> Add project
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFLECT VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ReflectView({ captures, health }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const captureTexts = captures.map(c => `"${c.text}" [${c.category}]`).join("\n");
      const result = await callAI(
        `You are Axis, an intelligent life reflection system. Write a short weekly reflection for someone who has ADHD-like nonlinear thinking and tends to be overwhelmed. Be warm, honest, and non-judgmental. NO bullet points. Write 2-3 short paragraphs. Surface one key pattern, one thing that needs attention, and one gentle reframe. Do not sound like a productivity coach. Sound like a wise, calm friend.`,
        `Current mood: ${health.mood}/5. Energy: ${health.energy}/5. Recent captures:\n${captureTexts}`
      );
      setInsight(result);
      setDone(true);
    } catch {
      setInsight("Couldn't generate a reflection right now — but the fact that you showed up to reflect says something. You're more consistent than you think.");
      setDone(true);
    }
    setLoading(false);
  };

  const PROMPTS = [
    "What patterns repeated this week?", "What gave you energy?",
    "What drained you most?", "What are you quietly avoiding?",
    "What actually mattered?", "What should you simplify?",
  ];

  return (
    <div className="view-enter">
      <Header title="Reflect" sub="Patterns reveal themselves when you look gently, without judgment." />

      {!done ? (
        <Card mb={24} style={{ textAlign: "center", padding: "36px 28px" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.accentBg, border: `1px solid ${T.accentBd}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Sparkles size={20} color={T.accent} />
          </div>
          <h3 style={{ fontFamily: T.display, fontSize: 20, color: T.text, marginBottom: 8 }}>Weekly Reflection</h3>
          <p style={{ fontSize: 13, color: T.sub, maxWidth: 280, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Axis will look at your recent captures and surface what's worth noticing — patterns, avoidance, energy.
          </p>
          <button onClick={generate} disabled={loading}
            style={{
              padding: "10px 28px", borderRadius: 8, cursor: "pointer",
              background: T.accentBg, border: `1px solid ${T.accentBd}`,
              color: T.accent, fontSize: 13, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 7,
            }}>
            {loading ? <><span className="dot1"/><span className="dot2"/><span className="dot3"/></> : <>Generate reflection <ArrowRight size={14} /></>}
          </button>
        </Card>
      ) : (
        <Card mb={24}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 14 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.accentBg, border: `1px solid ${T.accentBd}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={12} color={T.accent} />
            </div>
            <span style={{ fontSize: 11, color: T.accent, letterSpacing: "0.09em", textTransform: "uppercase" }}>Axis · Weekly Reflection</span>
          </div>
          <div style={{ fontFamily: T.display, fontSize: 15.5, lineHeight: 1.85, color: T.text, fontStyle: "italic" }}>
            {insight.split("\n\n").map((para, i) => <p key={i} style={{ marginBottom: i < insight.split("\n\n").length - 1 ? "1em" : 0 }}>{para}</p>)}
          </div>
          <button onClick={() => { setDone(false); setInsight(""); }}
            style={{ marginTop: 16, fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <RefreshCw size={11} /> Regenerate
          </button>
        </Card>
      )}

      <Label text="Reflection prompts" style={{ display: "block", marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PROMPTS.map(p => (
          <div key={p} style={{ padding: "12px 14px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12.5, color: T.sub, lineHeight: 1.45 }}>{p}</div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PEOPLE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function PeopleView() {
  const [people, setPeople] = useState(SEED_PEOPLE);
  const urgencyColor = { high: T.warm, medium: T.accent, low: T.muted };

  return (
    <div className="view-enter">
      <Header title="People" sub="Relationships need gentle attention, not perfect management." />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {people.map(p => (
          <div key={p.id} className="card-hov"
            style={{ padding: "14px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", gap: 13, transition: "all 0.18s" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.warmBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{p.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{p.name}</span>
                <span style={{ fontSize: 11, color: T.muted }}>{p.last}</span>
              </div>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: T.warm, background: T.warmBg, padding: "2px 8px", borderRadius: 20, border: `1px solid ${T.warmBd}` }}>{p.role}</span>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: urgencyColor[p.urgency] || T.muted }} />
              </div>
              <p style={{ fontSize: 12.5, color: T.sub, lineHeight: 1.4 }}>{p.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function HealthView({ health, setHealth }) {
  const set = (key, val) => setHealth(h => ({ ...h, [key]: val }));

  const rows = [
    { key: "mood",   label: "Mood",   emoji: "🌡", min: 1, max: 5, color: T.accent, fmt: v => ["—","Low","Tired","Okay","Good","Great"][v] },
    { key: "energy", label: "Energy", emoji: "⚡", min: 1, max: 5, color: T.warm,   fmt: v => ["—","Very low","Low","Medium","High","On fire"][v] },
    { key: "sleep",  label: "Sleep",  emoji: "🌙", min: 3, max: 12, color: T.lav,   fmt: v => `${v}h` },
    { key: "water",  label: "Water",  emoji: "💧", min: 0, max: 12, color: T.blue,  fmt: v => `${v} glasses` },
  ];
  const activities = [
    { id: "workout",  emoji: "🏋️", label: "Workout" },
    { id: "walk",     emoji: "🚶", label: "Walk" },
    { id: "meditate", emoji: "🧘", label: "Meditate" },
  ];

  return (
    <div className="view-enter">
      <Header title="Health" sub="Awareness, not obsession. Small consistencies compound." />

      <Card mb={14}>
        {rows.map(({ key, label, emoji, min, max, color, fmt }) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.sub }}>{emoji} {label}</span>
              <span style={{ fontSize: 13, color, fontWeight: 500 }}>{fmt(health[key])}</span>
            </div>
            <input type="range" min={min} max={max} value={health[key]}
              onChange={e => set(key, Number(e.target.value))}
              style={{ width: "100%", accentColor: color }} />
          </div>
        ))}
        <div style={{ paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          <Label text="Today's activity" style={{ display: "block", marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {activities.map(a => (
              <button key={a.id} onClick={() => set(a.id, !health[a.id])}
                style={{
                  flex: 1, padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                  background: health[a.id] ? T.accentBg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${health[a.id] ? T.accentBd : T.border}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all 0.18s",
                }}>
                <span style={{ fontSize: 20 }}>{a.emoji}</span>
                <span style={{ fontSize: 10, color: health[a.id] ? T.accent : T.muted }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ padding: "14px 16px", background: T.accentBg, border: `1px solid ${T.accentBd}`, borderRadius: 10, fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
        <span style={{ color: T.accent }}>✦ Axis notice · </span>
        {health.sleep < 6 ? "Your sleep is lower than optimal. Energy and focus are tightly coupled to sleep — consider protecting tonight." :
         health.energy <= 2 ? "Energy is low today. Don't fight it — reduce your list to one essential thing and restore." :
         health.mood <= 2 ? "Your mood is down. That's okay. Low mood doesn't need to be fixed immediately — just notice it." :
         "Looking balanced today. Protect this baseline — it's what consistent execution is built on."}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK CAPTURE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function QuickCapture({ onClose, onSave }) {
  const [text, setText] = useState("");
  const [cat, setCat]   = useState("💭 Thought");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const save = () => { if (text.trim()) onSave(text, cat); };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(8,9,15,0.82)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.18s ease",
      }}>
      <div style={{
        width: "100%", maxWidth: 500,
        background: T.surface, border: `1px solid ${T.borderMd}`,
        borderRadius: 18, padding: "24px",
        animation: "fadeUp 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontFamily: T.display, fontSize: 20, color: T.text }}>Quick Capture</span>
          <button onClick={onClose} style={{ color: T.muted, cursor: "pointer", lineHeight: 0 }}><X size={18} /></button>
        </div>
        <textarea ref={ref} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) save(); if (e.key === "Escape") onClose(); }}
          placeholder="What's on your mind? Dump it here — no judgment, no organizing needed."
          style={{
            width: "100%", background: "rgba(255,255,255,0.03)",
            border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 15px",
            color: T.text, fontSize: 15, resize: "none", lineHeight: 1.65,
            fontFamily: T.body, marginBottom: 13, outline: "none",
          }} rows={4} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {CAT_OPTIONS.slice(0, 6).map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                background: cat === c ? T.accentBg : "rgba(255,255,255,0.04)",
                border: `1px solid ${cat === c ? T.accentBd : T.border}`,
                color: cat === c ? T.accent : T.sub, transition: "all 0.15s",
              }}>{c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.sub, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={save} disabled={!text.trim()}
            style={{
              flex: 2, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: text.trim() ? T.accent : "rgba(255,255,255,0.06)",
              color: text.trim() ? T.bg : T.muted,
              cursor: text.trim() ? "pointer" : "default", transition: "all 0.2s",
            }}>
            Save capture →
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: T.muted, marginTop: 10 }}>⌘ + Enter to save · Esc to close</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════
function Card({ children, mb = 0, style = {} }) {
  return (
    <div style={{ padding: "16px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: mb, ...style }}>
      {children}
    </div>
  );
}
function Header({ title, sub }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <h2 style={{ fontFamily: T.display, fontSize: 34, fontWeight: 400, letterSpacing: "-0.025em", color: T.text, marginBottom: 5 }}>{title}</h2>
      <p style={{ fontSize: 13.5, color: T.sub }}>{sub}</p>
    </div>
  );
}
function Label({ text, color = T.muted, style = {} }) {
  return <span style={{ fontSize: 11, color, letterSpacing: "0.08em", textTransform: "uppercase", ...style }}>{text}</span>;
}
function Pill({ text }) {
  return <span style={{ fontSize: 10, color: T.muted, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20 }}>{text}</span>;
}
function StatusBadge({ status }) {
  return (
    <span style={{
      fontSize: 10, padding: "2px 9px", borderRadius: 20,
      background: status === "active" ? T.accentBg : "rgba(255,255,255,0.05)",
      color: status === "active" ? T.accent : T.muted,
      border: `1px solid ${status === "active" ? T.accentBd : T.border}`,
    }}>{status === "active" ? "Active" : "Paused"}</span>
  );
}
