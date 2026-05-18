import { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, Plus, Target, FolderOpen, Sparkles, Heart, Users,
  CheckCircle2, Circle, X, Send, RefreshCw, ArrowRight, Settings
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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght=0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght=9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  textarea, input, button, select { font-family: "DM Sans", system-ui, sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .view-enter { animation: fadeUp 0.38s cubic-bezier(0.16,1,0.3,1) both; }
  .dot1, .dot2, .dot3 {
    display: inline-block; width: 5px; height: 5px; border-radius: 50%;
    background: ${T.accent}; animation: dotBounce 1.3s infinite ease-in-out;
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40%           { transform: translateY(-4px); opacity: 1; }
  }
  .dot2 { animation-delay: 0.18s; }
  .dot3 { animation-delay: 0.36s; }
  input[type=range] { -webkit-appearance: none; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.08); outline: none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${T.accent}; cursor: pointer; border: 2px solid ${T.bg}; }
`;

const SEED_CAPTURES = [
  { id: 1, text: "Build the AI prioritization logic — should feel like a calm advisor", category: "🗂 Project", time: "2h ago", bg: T.lavBg },
  { id: 2, text: "Reply to Priya about the freelance proposal she sent over", category: "👥 People", time: "yesterday", bg: T.warmBg },
];

const SEED_PROJECTS = [
  { id: 1, name: "Personal OS App", tag: "Building", next: "Design the reflection view wireframe", progress: 60, status: "active" },
  { id: 2, name: "Freelance Client Work", tag: "Revenue", next: "Send revised proposal to Priya", progress: 30, status: "active" },
];

const SEED_PEOPLE = [
  { id: 1, name: "Priya", role: "Colleague", last: "3 days ago", note: "Needs reply on freelance proposal", emoji: "👩" },
  { id: 2, name: "Mom", role: "Family", last: "1 week ago", note: "Call this weekend to catch up", emoji: "👩‍🦳" },
];

const CAT_OPTIONS = ["💭 Thought","💡 Idea","🗂 Project","👥 People","🏃 Health","😌 Emotion"];
const NAV = [
  { id: "today",    Icon: Home,       label: "Today" },
  { id: "capture",  Icon: Plus,       label: "Capture" },
  { id: "focus",    Icon: Target,     label: "Focus" },
  { id: "projects", Icon: FolderOpen, label: "Projects" },
  { id: "reflect",  Icon: Sparkles,   label: "Reflect" },
  { id: "people",   Icon: Users,      label: "People" },
  { id: "health",   Icon: Heart,      label: "Health" },
  { id: "settings", Icon: Settings,   label: "Settings" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return { hi: "Good morning.",  sub: "Let's start gently today." };
  if (h < 17) return { hi: "Good afternoon.",sub: "How's the day unfolding?" };
  return             { hi: "Good evening.",   sub: "Winding down or still in flow?" };
}

// ─── LIVE CLIENT-SIDE CHAT ROUTING (BYOK) ──────────────────────────────────────
async function callLiveAI(provider, apiKey, userMsg, systemPrompt = "") {
  if (!apiKey) return "Please go to the Settings tab and add your personal API Key to enable live advisor responses.";
  
  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt || "You are a calm, concise assistant." },
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No response received.";
    } 
    
    if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No response received.";
    }

    return "Selected provider setup is still parsing. Check back shortly.";
  } catch (err) {
    return `Connection error: ${err.message}. Double check your key validity and internet configurations.`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("today");
  
  // LocalStorage Persisted States
  const [captures, setCaptures] = useState(() => {
    const saved = localStorage.getItem("axis_captures");
    return saved ? JSON.parse(saved) : SEED_CAPTURES;
  });
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("axis_tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Reply to Priya's freelance proposal", done: false },
      { id: 2, text: "30 min deep work session on the app", done: true },
    ];
  });
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("axis_projects");
    return saved ? JSON.parse(saved) : SEED_PROJECTS;
  });
  const [people, setPeople] = useState(() => {
    const saved = localStorage.getItem("axis_people");
    return saved ? JSON.parse(saved) : SEED_PEOPLE;
  });
  const [health, setHealth] = useState(() => {
    const saved = localStorage.getItem("axis_health");
    return saved ? JSON.parse(saved) : { mood: 3, energy: 3, sleep: 7, water: 4 };
  });

  // API Config State
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem("axis_ai_config");
    return saved ? JSON.parse(saved) : { provider: "openai", key: "" };
  });

  const [modalOpen, setModalOpen] = useState(false);

  // Sync state mutations to physical LocalStorage
  useEffect(() => { localStorage.setItem("axis_captures", JSON.stringify(captures)); }, [captures]);
  useEffect(() => { localStorage.setItem("axis_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("axis_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("axis_people", JSON.stringify(people)); }, [people]);
  useEffect(() => { localStorage.setItem("axis_health", JSON.stringify(health)); }, [health]);
  useEffect(() => { localStorage.setItem("axis_ai_config", JSON.stringify(aiConfig)); }, [aiConfig]);

  const addCapture = useCallback((text, category = "💭 Thought") => {
    setCaptures(p => [{ id: Date.now(), text, category, time: "just now", bg: T.accentBg }, ...p]);
  }, []);

  return (
    <div style={{ fontFamily: T.body, background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <style>{GLOBAL_CSS}</style>

      {/* SIDEBAR NAVIGATION */}
      <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 214, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", zIndex: 50 }}>
        <div style={{ padding: "26px 22px 22px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.display, fontSize: 24, color: T.text, letterSpacing: "-0.02em" }}>Axis</div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Operating System</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ id, Icon, label }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => setView(id)} 
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 8,
                  background: active ? T.accentBg : "transparent", color: active ? T.accent : T.sub,
                  fontSize: 13.5, cursor: "pointer", border: "none", width: "100%", textAlign: "left"
                }}>
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* CORE VIEWPORT */}
      <main style={{ flex: 1, marginLeft: 214, minHeight: "100vh" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 36px 120px" }}>
          {view === "today"    && <TodayView captures={captures} health={health} setHealth={setHealth} tasks={tasks} setTasks={setTasks} />}
          {view === "capture"  && <CaptureView captures={captures} addCapture={addCapture} setCaptures={setCaptures} />}
          {view === "focus"    && <FocusView config={aiConfig} />}
          {view === "projects" && <ProjectsView projects={projects} setProjects={setProjects} />}
          {view === "reflect"  && <ReflectView captures={captures} config={aiConfig} />}
          {view === "people"   && <PeopleView people={people} setPeople={setPeople} />}
          {view === "health"   && <HealthView health={health} setHealth={setHealth} />}
          {view === "settings" && <SettingsView config={aiConfig} setConfig={setAiConfig} />}
        </div>
      </main>

      {/* FLOATING QUICK CAPTURE BUTTON */}
      <button onClick={() => setModalOpen(true)}
        style={{ position: "fixed", bottom: 28, right: 28, width: 50, height: 50, borderRadius: "50%", background: T.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
        <Plus size={20} color={T.bg} />
      </button>

      {modalOpen && <QuickCapture onClose={() => setModalOpen(false)} onSave={(t, c) => { addCapture(t, c); setModalOpen(false); }} />}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// MODULE SUB-COMPONENTS
// ───────────────────────────────────────────────────────────────────────────────

function TodayView({ captures, health, setHealth, tasks, setTasks }) {
  const { hi, sub } = greeting();
  const [newTask, setNewTask] = useState("");

  return (
    <div className="view-enter">
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontFamily: T.display, fontSize: 38, color: T.text, fontWeight: 400, margin: 0 }}>{hi}</h1>
        <p style={{ fontSize: 14, color: T.sub, margin: "4px 0 0" }}>{sub}</p>
      </div>

      <Card mb={16}>
        <Label text="Today's Active Checklist" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ background: "transparent", border: "none", color: t.done ? T.accent : T.muted, cursor: "pointer", display: "flex" }}>
                {t.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <span style={{ fontSize: 14, color: t.done ? T.muted : T.text, textDecoration: t.done ? "line-through" : "none", flex: 1 }}>{t.text}</span>
              <button onClick={() => setTasks(ts => ts.filter(x => x.id !== t.id))} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer" }}><X size={14} /></button>
            </div>
          ))}
        </div>
        <input value={newTask} onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newTask.trim()) { setTasks(ts => [...ts, { id: Date.now(), text: newTask, done: false }]); setNewTask(""); } }}
          placeholder="Add local daily task... (Press Enter)"
          style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, padding: "8px 12px", borderRadius: 6, color: T.text, fontSize: 13, marginTop: 14, outline: "none" }} />
      </Card>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Label text="Recent Cloud Storage Backups" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {captures.slice(0, 3).map(c => (
            <div key={c.id} style={{ padding: "12px 14px", background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 13.5, color: T.text, margin: "0 0 6px" }}>{c.text}</p>
              <span style={{ fontSize: 10, color: T.accent, background: T.accentBg, padding: "2px 6px", borderRadius: 4 }}>{c.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CaptureView({ captures, addCapture, setCaptures }) {
  const [text, setText] = useState("");
  const [cat, setCat] = useState("💭 Thought");

  return (
    <div className="view-enter">
      <Header title="Raw Brain Dump" sub="Empty your working memory. Don't worry about order right now." />
      <Card mb={16}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type anything lingering in your head..." style={{ width: "100%", background: "transparent", border: "none", color: T.text, fontSize: 15, resize: "none", outline: "none" }} rows={4} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}`, padding: "4px 8px", borderRadius: 6, outline: "none" }}>
            {CAT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <button onClick={() => { if (text.trim()) { addCapture(text, cat); setText(""); } }} style={{ padding: "6px 16px", background: T.accent, color: T.bg, border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>Save</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
        {captures.map(c => (
          <div key={c.id} style={{ padding: "12px 14px", background: T.card, borderRadius: 8, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 13.5, color: T.text, margin: "0 0 4px" }}>{c.text}</p>
              <span style={{ fontSize: 10, color: T.sub }}>{c.category}</span>
            </div>
            <button onClick={() => setCaptures(cs => cs.filter(x => x.id !== c.id))} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer" }}><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusView({ config }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hey. What's pulling at your executive attention right now? Let's filter out the noise." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    const systemPrompt = "You are Axis—a calm, direct, warm assistant for someone managing executive dysfunction. Keep responses under 3 sentences.";
    const reply = await callLiveAI(config.provider, config.key, userText, systemPrompt);
    
    setMessages(prev => [...prev, { role: "ai", text: reply }]);
    setLoading(false);
  };

  return (
    <div className="view-enter">
      <Header title="Focus Engine" sub="Direct alignment workspace. Powered by your API key." />
      <Card mb={16} style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 350, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? T.accentBg : "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 10, border: `1px solid ${m.role === "user" ? T.accentBd : T.border}`, maxWidth: "85%", fontSize: 14 }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{ fontSize: 12, color: T.muted }}><span className="dot1"/> <span className="dot2"/> <span className="dot3"/></div>}
      </Card>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSend(); }} placeholder="What's making it hard to focus?" style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 8, color: T.text, outline: "none" }} />
        <button onClick={handleSend} style={{ background: T.accent, color: T.bg, border: "none", padding: "0 16px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}><Send size={16} /></button>
      </div>
    </div>
  );
}

function ProjectsView({ projects, setProjects }) {
  const [name, setName] = useState("");
  const [next, setNext] = useState("");

  const addProject = () => {
    if (!name.trim()) return;
    setProjects(p => [...p, { id: Date.now(), name, tag: "Track", next: next || "Define first step", progress: 0, status: "active" }]);
    setName(""); setNext("");
  };

  return (
    <div className="view-enter">
      <Header title="Active Tracks" sub="One essential physical action step per project loop." />
      <Card mb={16}>
        <Label text="New Track" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Project Name" style={{ background: T.bg, border: `1px solid ${T.border}`, padding: "8px", borderRadius: 6, color: T.text, outline: "none" }} />
          <input value={next} onChange={e => setNext(e.target.value)} placeholder="Immediate Next Physical Step" style={{ background: T.bg, border: `1px solid ${T.border}`, padding: "8px", borderRadius: 6, color: T.text, outline: "none" }} />
          <button onClick={addProject} style={{ background: T.accent, color: T.bg, padding: "8px", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer", marginTop: 4 }}>Add Loop</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map(p => (
          <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: T.text }}>{p.name}</span>
              <p style={{ fontSize: 13, color: T.sub, margin: "6px 0 0" }}>Next: <span style={{ color: T.warm }}>{p.next}</span></p>
            </div>
            <button onClick={() => setProjects(ps => ps.filter(x => x.id !== p.id))} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer" }}><X size={14} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReflectView({ captures, config }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const triggerWeeklyReflection = async () => {
    if (captures.length === 0) {
      setAnalysis("Your capture buffers are empty. Record a few thoughts first.");
      return;
    }
    setLoading(true);
    const logdump = captures.map(c => `[${c.category}]: ${c.text}`).join("\n");
    const prompt = `Analyze these recent notebook inputs and give a short, wise 2-paragraph reflection highlighting patterns or cognitive loops:\n\n${logdump}`;
    const response = await callLiveAI(config.provider, config.key, prompt, "You are a grounding life strategist.");
    setAnalysis(response);
    setLoading(false);
  };

  return (
    <div className="view-enter">
      <Header title="Orientation Reflection" sub="Run a cognitive check over your structural loops." />
      <Card mb={16}>
        <button onClick={triggerWeeklyReflection} disabled={loading} style={{ width: "100%", padding: 12, background: T.accentBg, border: `1px solid ${T.accentBd}`, color: T.accent, borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
          {loading ? "Analyzing Buffers..." : "Generate AI Reflection Matrix"}
        </button>
        {analysis && (
          <div style={{ marginTop: 16, fontSize: 14, color: T.text, lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            {analysis}
          </div>
        )}
      </Card>
    </div>
  );
}

function PeopleView({ people, setPeople }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const addPerson = () => {
    if (!name.trim()) return;
    setPeople(p => [...p, { id: Date.now(), name, role: "Contact", last: "Just now", note: note || "Stay in touch", emoji: "👤" }]);
    setName(""); setNote("");
  };

  return (
    <div className="view-enter">
      <Header title="Social Spheres" sub="Keep connection baselines open without scheduling guilt." />
      <Card mb={16}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ background: T.bg, border: `1px solid ${T.border}`, padding: "8px", borderRadius: 6, color: T.text, outline: "none" }} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Context Note" style={{ background: T.bg, border: `1px solid ${T.border}`, padding: "8px", borderRadius: 6, color: T.text, outline: "none" }} />
          <button onClick={addPerson} style={{ background: T.accent, color: T.bg, padding: "8px", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>Track Contact</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {people.map(p => (
          <Card key={p.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{p.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{p.name}</span>
                <button onClick={() => setPeople(ps => ps.filter(x => x.id !== p.id))} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer" }}><X size={14} /></button>
              </div>
              <p style={{ fontSize: 12, color: T.sub, margin: "2px 0 0" }}>{p.note}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HealthView({ health, setHealth }) {
  const sliders = [
    { key: "mood", label: "Subjective Mood Check", min: 1, max: 5 },
    { key: "energy", label: "Cognitive Energy Pool", min: 1, max: 5 },
    { key: "sleep", label: "Sleep Duration (Hours)", min: 4, max: 12 },
    { key: "water", label: "Water Level (Glasses)", min: 0, max: 10 },
  ];

  return (
    <div className="view-enter">
      <Header title="Biometric Indicators" sub=" loosely monitor physical systems fueling executive function." />
      <Card>
        {sliders.map(s => (
          <div key={s.key} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: T.sub }}>
              <span>{s.label}</span>
              <span style
