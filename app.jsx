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

// ─── DEPLOYMENT COMPATIBLE LOCAL AI RESPONSE MOCK ──────────────────────────────
async function callAI(systemPrompt, userMsg, history = []) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const text = userMsg.toLowerCase();
  
  if (text.includes("overwhelmed") || text.includes("simplify")) {
    return "Let's pause right here. Take a single breath. Out of everything pulling at your brain, pick just one task—even a tiny one. Let the rest wait until tomorrow.";
  }
  if (text.includes("focus") || text.includes("important")) {
    return "Your active project logs show 'Personal OS App' is taking up the most cognitive weight. Write down the absolute next action step, hide your tabs, and protect a 20-minute flow state window.";
  }
  return "I hear you completely. When things are scattered, consistency matters more than perfection. What is the single easiest action block we can clear off your plate right now?";
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView]         = useState("today");
  const [captures, setCaptures] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("axis_captures");
      return saved ? JSON.parse(saved) : SEED_CAPTURES;
    }
    return SEED_CAPTURES;
  });
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [health, setHealth]     = useState({ mood: 3, energy: 3, sleep: 7, water: 3, workout: false, walk: false, meditate: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [mantra]                = useState(() => MANTRAS[Math.floor(Math.random() * MANTRAS.length)]);

  useEffect(() => {
    localStorage.setItem("axis_captures", JSON.stringify(captures));
  }, [captures]);

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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPTURE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function CaptureView({ captures, addCapture, setCaptures }) {
  const [text, setText]   = useState("");
  const [cat, setCat]     = useState("💭 Thought");

  const save = () => {
    if (!text.trim()) return;
    addCapture(text, cat);
    setText(""); setCat("💭 Thought");
  };

  return (
    <div className="view-enter">
      <Header title="Capture" sub="Get it out of your head. No organization needed right now." />

      <Card mb={12}>
        <textarea value={text} onChange={e => setText(e.target.value)} autoFocus
          placeholder="What's on your mind? Dump it layout..."
          style={{
            width: "100%", background: "transparent", border: "none", color: T.text,
            fontSize: 15.5, lineHeight: 1.7, resize: "none", outline: "none",
            fontFamily: T.body, minHeight: 110,
          }} rows={5} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
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
          <button key={c} onClick={() => setCat(c)} className="tag-btn"
            style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
              background: cat === c ? T.accentBg : "rgba(255,255,255,0.04)",
              border: `1px solid ${cat === c ? T.accentBd : T.border}`,
              color: cat === c ? T.accent : T.sub,
            }}>{c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOCUS VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function FocusView({ captures, projects }) {
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
    
    const reply = await callAI("", userText, []);
    setMessages([...updated, { role: "assistant", text: reply }]);
    setLoading(false);
  };

  return (
    <div className="view-enter">
      <Header title="Focus" sub="Your calm AI advisor. Direct, honest, no judgment." />
      <Card mb={16} style={{ padding: 0 }}>
        <div style={{ padding: "16px 18px", maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
              <div style={{
                maxWidth: "80%", padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6, color: T.text,
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                background: m.role === "user" ? T.accentBg : T.card,
                border: `1px solid ${m.role === "user" ? T.accentBd : T.border}`,
              }}>{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 9, alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="What's on your mind?"
            style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontSize: 13.5, resize: "none", outline: "none", fontFamily: T.body }} rows={1} />
          <button onClick={send}
            style={{ width: 32, height: 32, borderRadius: 7, background: T.accent, color: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={13} />
          </button>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsView({ projects, setProjects }) {
  return (
    <div className="view-enter">
      <Header title="Projects" sub="Simple. One clear next step per project. Nothing more." />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {projects.map(p => (
          <div key={p.id} style={{ padding: "16px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <span style={{ fontSize: 14.5, fontWeight: 500, color: T.text }}>{p.name}</span>
            <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4 }}>Next: <span style={{ color: T.warm }}>{p.next}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFLECT VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ReflectView({ captures, health }) {
  return (
    <div className="view-enter">
      <Header title="Reflect" sub="Patterns reveal themselves when you look gently." />
      <Card mb={24}>
        <p style={{ fontFamily: T.display, fontSize: 16, fontStyle: "italic", color: T.text }}>
          "Reviewing recent captures maps behavior metrics directly. You are more consistent than you think."
        </p>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PEOPLE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function PeopleView() {
  const [people] = useState(SEED_PEOPLE);
  return (
    <div className="view-enter">
      <Header title="People" sub="Relationships need gentle attention, not perfect management." />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {people.map(p => (
          <div key={p.id} style={{ padding: "14px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{p.name}</span>
            <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4 }}>{p.note}</p>
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
  return (
    <div className="view-enter">
      <Header title="Health" sub="Awareness, not obsession. Small consistencies compound." />
      <Card mb={14}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: T.sub }}>⚡ Log Baseline Metrics</span>
          <span style={{ fontSize: 13, color: T.accent, fontWeight: 500 }}>Balanced</span>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK CAPTURE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function QuickCapture({ onClose, onSave }) {
  const [text, setText] = useState("");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,9,15,0.82)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: T.surface, border: `1px solid ${T.borderMd}`, borderRadius: 18, padding: 24 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Dump it here..." style={{ width: "100%", background: "transparent", border: "none", color: T.text, fontSize: 15 }} rows={4} />
        <button onClick={() => { onSave(text, "💭 Thought"); }} style={{ width: "100%", marginTop: 12, padding: 10, background: T.accent, color: T.bg, border: "none", borderRadius: 8, cursor: "pointer" }}>Save Capture</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════
function Card({ children, mb = 0, style = {} }) {
  return <div style={{ padding: "16px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: mb, ...style }}>{children}</div>;
}
function Header({ title, sub }) {
  return <div style={{ marginBottom: 30 }}><h2 style={{ fontFamily: T.display, fontSize: 34, fontWeight: 400, color: T.text, marginBottom: 5 }}>{title}</h2><p style={{ fontSize: 13.5, color: T.sub }}>{sub}</p></div>;
}
function Label({ text, color = T.muted, style = {} }) {
  return <span style={{ fontSize: 11, color, letterSpacing: "0.08em", textTransform: "uppercase", ...style }}>{text}</span>;
}
function Pill({ text }) {
  return <span style={{ fontSize: 10, color: T.muted, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20 }}>{text}</span>;
}
