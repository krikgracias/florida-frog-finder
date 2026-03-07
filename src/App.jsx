import { useState, useRef, useEffect, useCallback } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────
const FROGS = [
  { name:"American Bullfrog",          sci:"Lithobates catesbeianus",      color:"#4a7c59", call:"Deep resonant 'jug-o-rum' bass bellow, slow & low",        habitat:"Permanent ponds, lakes, slow rivers",      size:'3.5–8"' },
  { name:"Green Treefrog",             sci:"Hyla cinerea",                 color:"#6aab3a", call:"Loud nasal 'queenk-queenk' bell-like chorus, rapid",        habitat:"Vegetation near ponds, ditches, swamps",   size:'1.25–2.5"' },
  { name:"Squirrel Treefrog",          sci:"Hyla squirella",               color:"#8bc34a", call:"Raspy duck-like quacking, variable & scolding",            habitat:"Gardens, trees, shrubs near water",        size:'0.9–1.6"' },
  { name:"Barking Treefrog",           sci:"Hyla gratiosa",                color:"#558b2f", call:"Loud single 'toonk' bark repeated, like distant dog",      habitat:"High in trees, sandy scrub, pine flatwoods",size:'2–2.75"' },
  { name:"Pine Woods Treefrog",        sci:"Hyla femoralis",               color:"#795548", call:"Rapid morse-code 'dit-dit-dit' rattle, high-pitched",      habitat:"Pine flatwoods, sandy pinelands",          size:'1–1.75"' },
  { name:"Cuban Treefrog",             sci:"Osteopilus septentrionalis",   color:"#9e9d24", call:"Harsh raspy snore, grating & irregular",                   habitat:"Buildings, trees, urban areas (invasive)",  size:'1.5–5.5"' },
  { name:"Southern Leopard Frog",      sci:"Lithobates sphenocephalus",    color:"#33691e", call:"Chuckling croaks & guttural squeaks, rubber-band twangs",  habitat:"Nearly any freshwater, very adaptable",    size:'2–3.5"' },
  { name:"Pig Frog",                   sci:"Lithobates grylio",            color:"#37474f", call:"Deep pig-like grunt 'grunt-grunt', repeated low rumble",   habitat:"Lily pad marshes, cypress swamps, Everglades",size:'3.25–6.5"' },
  { name:"River Frog",                 sci:"Lithobates heckscheri",        color:"#546e7a", call:"Low snoring grunts & growls, nocturnal riverbanks",        habitat:"Swampy river margins, permanent water",    size:'3.25–5.25"' },
  { name:"Florida Bog Frog",           sci:"Lithobates okaloosae",         color:"#2e7d32", call:"Series of low clucks, quiet & rarely heard",               habitat:"Seepage bogs, NW Florida panhandle only",  size:'1.4–1.8"' },
  { name:"Carpenter Frog",             sci:"Lithobates virgatipes",        color:"#a1887f", call:"'Hammering' two-note clink, like carpenter's hammer",      habitat:"Sphagnum bogs, titi swamps, blackwater",   size:'1.6–2.6"' },
  { name:"Gopher Frog",               sci:"Lithobates capito",            color:"#8d6e63", call:"Deep snoring roar, explosive & carrying, chorus is loud",  habitat:"Longleaf pine/gopher tortoise burrow areas",size:'2.6–3.75"' },
  { name:"Eastern Narrow-mouthed Toad",sci:"Gastrophryne carolinensis",   color:"#616161", call:"High-pitched nasal bleat 'waaah', sheep-like",             habitat:"Under debris, moist forests near water",   size:'0.75–1.5"' },
  { name:"Oak Toad",                   sci:"Anaxyrus quercicus",           color:"#78909c", call:"High peeping whistle, bird-like, tiny but piercing",       habitat:"Sandy pinelands, scrub, longleaf pine",    size:'0.75–1.3"' },
  { name:"Southern Toad",              sci:"Anaxyrus terrestris",          color:"#8d6e63", call:"High-pitched musical trill, long continuous buzz",         habitat:"Sandy soil, suburban yards, almost anywhere",size:'1.5–3.5"' },
  { name:"Eastern Spadefoot Toad",     sci:"Scaphiopus holbrookii",        color:"#5d4037", call:"Low hoarse moan 'waaah', explosive after heavy rain only", habitat:"Sandy uplands, emerges for rain events only",size:'1.75–3.25"' },
  { name:"Little Grass Frog",          sci:"Pseudacris ocularis",          color:"#9ccc65", call:"Tiny insect-like 'seee-seee' cricket chirp, very high",    habitat:"Grassy edges of shallow wetlands",         size:'0.4–0.6"' },
  { name:"Southern Chorus Frog",       sci:"Pseudacris nigrita",           color:"#78909c", call:"Rapid ratchet trill, like running finger along comb",      habitat:"Shallow grassy ponds, wet meadows in winter",size:'0.75–1.25"' },
  { name:"Ornate Chorus Frog",         sci:"Pseudacris ornata",            color:"#66bb6a", call:"Metallic 'peep' repeated rapidly, sharp & high",           habitat:"Flatwoods, grassy ephemeral ponds, winter",size:'0.9–1.5"' },
];

const SOUND_SYSTEM = `You are an expert Florida herpetologist and bioacoustician. The user has recorded ambient audio trying to identify frog calls.

Based on the audio description/waveform data provided, identify which of these 19 Florida frog/toad species is most likely calling:
${FROGS.map(f=>`- ${f.name} (${f.sci}): ${f.call}`).join('\n')}

Respond ONLY in valid JSON (no markdown):
{
  "identified": true or false,
  "species": "exact name from list or null",
  "confidence": "High/Medium/Low",
  "confidencePercent": 75,
  "callDescription": "what the call sounds like in this recording",
  "habitat": "where this species lives",
  "size": "size range",
  "behavior": "calling behavior/season/time",
  "funFact": "one interesting fact",
  "conservationStatus": "status",
  "notes": "additional observations"
}`;

const PHOTO_SYSTEM = `You are an expert herpetologist specializing in Florida's 19 native frog species.
${FROGS.map(f=>`- ${f.name} (${f.sci})`).join('\n')}
Respond ONLY in valid JSON (no markdown):
{
  "identified": true or false,
  "species": "exact name or null",
  "confidence": "High/Medium/Low",
  "confidencePercent": 85,
  "habitat": "habitat",
  "size": "size",
  "distinguishing": "key features seen",
  "funFact": "one fact",
  "conservationStatus": "status",
  "notes": "additional notes"
}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const callAPI = async (messages, system) => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  const txt = d.content?.find(b => b.type === "text")?.text || "";
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
};

const confColor = c => c === "High" ? "#4caf50" : c === "Medium" ? "#ffb300" : "#ef5350";
const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

// ── Spectrogram ───────────────────────────────────────────────────────────────
function Spectrogram({ analyserRef, isRecording, audioData }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const colRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#020f06";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!isRecording || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const buf = new Uint8Array(analyserRef.current.frequencyBinCount);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(buf);
      const sliceH = H / buf.length;
      for (let i = 0; i < buf.length; i++) {
        const v = buf[i] / 255;
        const y = H - i * sliceH;
        const r = Math.floor(v < 0.5 ? 0 : (v - 0.5) * 2 * 200);
        const g = Math.floor(v < 0.5 ? v * 2 * 180 : 180 - (v - 0.5) * 2 * 60);
        const b = Math.floor(v < 0.5 ? v * 2 * 80 : 0);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(colRef.current, y, 2, sliceH + 1);
      }
      colRef.current = (colRef.current + 2) % W;
      ctx.fillStyle = "rgba(200,255,200,0.12)";
      ctx.fillRect(colRef.current, 0, 1, H);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording || !audioData?.length) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "#020f06";
    ctx.fillRect(0, 0, W, H);
    const step = Math.max(1, Math.floor(audioData.length / W));
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const v = (audioData[x * step] || 0) / 255;
      const y = H - v * H;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let x = 0; x < W; x++) {
      const v = (audioData[x * step] || 0) / 255;
      const hue = 120 + v * 60;
      ctx.fillStyle = `hsla(${hue},80%,45%,${v * 0.6})`;
      ctx.fillRect(x, H - v * H * 0.8, 2, v * H * 0.8);
    }
  }, [isRecording, audioData]);

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#020f06", border: "1px solid #1b5e20" }}>
      <canvas ref={canvasRef} width={440} height={120} style={{ width: "100%", height: 120, display: "block" }} />
      <div style={{ position: "absolute", top: 6, left: 8, fontSize: 9, color: "#2e7d32", fontFamily: "monospace", letterSpacing: "1px" }}>
        {isRecording ? "● LIVE" : audioData?.length ? "RECORDED" : "SPECTROGRAM"}
      </div>
      <div style={{ position: "absolute", right: 6, top: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        {["20kHz", "10kHz", "5kHz", "1kHz", "100Hz"].map(l => (
          <div key={l} style={{ fontSize: 7, color: "#2e7d32", fontFamily: "monospace" }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ result, frog, onPlayCall, playingId, type }) {
  const accent    = frog?.color || "#43a047";
  const isPlaying = playingId === frog?.name;

  if (!result.identified) return (
    <div style={{ marginTop: 16, padding: 20, borderRadius: 18, background: "rgba(27,94,32,.15)", border: "1px solid #2e7d3244", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🤔</div>
      <h3 style={{ color: "#ffb300", fontSize: 16, fontFamily: "'Playfair Display',serif", marginBottom: 6 }}>Not identified as a Florida frog</h3>
      <p style={{ color: "#81c784", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>{result.notes}</p>
    </div>
  );

  const details = [
    { icon: "🌿", label: "Habitat",   val: result.habitat },
    { icon: "📏", label: "Size",      val: result.size || frog?.size },
    { icon: "🎵", label: "Call",      val: result.callDescription || frog?.call },
    { icon: "🔎", label: type === "sound" ? "Call Features" : "Features Seen", val: result.distinguishing },
    { icon: "🛡️", label: "Conservation", val: result.conservationStatus },
  ].filter(x => x.val);

  // deduplicate
  const seen = new Set();
  const uniq = details.filter(x => { if (seen.has(x.val)) return false; seen.add(x.val); return true; }).slice(0, 4);

  return (
    <div style={{ marginTop: 16, padding: 18, borderRadius: 20, background: `linear-gradient(135deg,rgba(27,94,32,.25),rgba(10,20,12,.4))`, border: `1px solid ${accent}55`, boxShadow: `0 8px 40px ${accent}18` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#c8e6c9", lineHeight: 1.2, marginBottom: 2 }}>{result.species}</h2>
          <div style={{ fontSize: 11, fontStyle: "italic", color: "#66bb6a", fontFamily: "'DM Sans',sans-serif" }}>{frog?.sci}</div>
        </div>
        <div style={{ textAlign: "center", padding: "8px 12px", borderRadius: 12, background: `${confColor(result.confidence)}15`, border: `1px solid ${confColor(result.confidence)}44`, minWidth: 56 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: confColor(result.confidence), fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}>{result.confidencePercent}%</div>
          <div style={{ fontSize: 9, color: confColor(result.confidence), fontFamily: "'DM Sans',sans-serif", letterSpacing: "1px", marginTop: 2 }}>{result.confidence?.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ height: 1, background: `${accent}30`, marginBottom: 12 }} />

      {uniq.map(({ icon, label, val }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#66bb6a", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{icon} {label}</div>
          <div style={{ fontSize: 13, color: "#dcedc8", lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{val}</div>
        </div>
      ))}

      {result.funFact && (
        <div style={{ margin: "12px 0", padding: "10px 14px", background: "rgba(102,187,106,.1)", borderRadius: 10, borderLeft: "3px solid #66bb6a" }}>
          <div style={{ fontSize: 9, color: "#66bb6a", letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif", marginBottom: 3 }}>🌟 FUN FACT</div>
          <div style={{ fontSize: 13, color: "#c8e6c9", lineHeight: 1.5, fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>{result.funFact}</div>
        </div>
      )}

      {frog && (
        <button onClick={() => onPlayCall(frog)} style={{
          width: "100%", padding: "11px", borderRadius: 12, marginTop: 8,
          background: isPlaying ? "rgba(76,175,80,.2)" : "rgba(27,94,32,.3)",
          border: `1px solid ${isPlaying ? "#66bb6a" : "#2e7d32"}`,
          color: isPlaying ? "#a5d6a7" : "#66bb6a",
          cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s"
        }}>
          {isPlaying ? "🔊 Playing example call..." : "▶ Play Example Call Description"}
        </button>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function FrogFinder() {
  const [tab, setTab]               = useState("sound");
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [audioData, setAudioData]   = useState(null);
  const [soundResult, setSoundResult] = useState(null);
  const [image, setImage]           = useState(null);
  const [imgB64, setImgB64]         = useState(null);
  const [photoResult, setPhotoResult] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [journal, setJournal]       = useState([]);
  const [playingId, setPlayingId]   = useState(null);
  const [noApiKey, setNoApiKey]     = useState(false);

  const mediaRecRef  = useRef(null);
  const analyserRef  = useRef(null);
  const chunksRef    = useRef([]);
  const timerRef     = useRef(null);
  const freqDataRef  = useRef([]);
  const fileRef      = useRef(null);

  useEffect(() => {
    if (!ANTHROPIC_API_KEY) setNoApiKey(true);
  }, []);

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = async () => {
    setError(null); setSoundResult(null); setAudioData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioCtx.createAnalyser();
      analyserRef.current.fftSize = 256;
      audioCtx.createMediaStreamSource(stream).connect(analyserRef.current);

      chunksRef.current   = [];
      freqDataRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const flat = freqDataRef.current.flat();
        setAudioData(flat.length ? flat : Array(128).fill(0));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(100);
      mediaRecRef.current = mr;

      const snapInterval = setInterval(() => {
        if (!analyserRef.current) return;
        const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(buf);
        freqDataRef.current.push(Array.from(buf));
      }, 100);

      setIsRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => {
        setRecSeconds(s => {
          if (s >= 29) { stopRecording(); clearInterval(snapInterval); return 30; }
          return s + 1;
        });
      }, 1000);

      setTimeout(() => {
        clearInterval(snapInterval);
        if (mr.state !== "inactive") { mr.stop(); setIsRecording(false); clearInterval(timerRef.current); }
      }, 30000);

    } catch {
      setError("Microphone access denied. Please allow microphone permissions and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current?.state !== "inactive") mediaRecRef.current.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  // ── Identify Sound ────────────────────────────────────────────────────────
  const identifySound = async () => {
    if (!audioData) return;
    setLoading(true); setError(null);
    try {
      const vals = audioData.slice(0, 200);
      const avg  = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
      const peak = Math.max(...vals);
      const desc = `Audio waveform: avg amplitude ${avg}/255, peak ${peak}/255, ${recSeconds}s recording in a Florida wetland/swamp environment. Identify the frog call.`;
      const result = await callAPI([{ role: "user", content: desc }], SOUND_SYSTEM);
      setSoundResult(result);
      if (result.identified && result.species) addToJournal(result, "sound");
    } catch (e) {
      setError(e.message || "Identification failed. Try a longer recording with less background noise.");
    }
    setLoading(false);
  };

  // ── Photo ─────────────────────────────────────────────────────────────────
  const handlePhoto = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => { setImage(e.target.result); setImgB64(e.target.result.split(",")[1]); setPhotoResult(null); setError(null); };
    r.readAsDataURL(file);
  };

  const identifyPhoto = async () => {
    if (!imgB64) return;
    setLoading(true); setError(null);
    try {
      const result = await callAPI([{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imgB64 } },
          { type: "text", text: "Identify this Florida frog. Respond in JSON only." }
        ]
      }], PHOTO_SYSTEM);
      setPhotoResult(result);
      if (result.identified && result.species) addToJournal(result, "photo");
    } catch (e) {
      setError(e.message || "Identification failed. Try a clearer, well-lit photo.");
    }
    setLoading(false);
  };

  // ── Journal ───────────────────────────────────────────────────────────────
  const addToJournal = (result, type) => {
    const frog = FROGS.find(f => f.name === result.species);
    setJournal(prev => [{
      id: Date.now(), type,
      species: result.species,
      scientific: frog?.sci,
      confidence: result.confidence,
      confidencePercent: result.confidencePercent,
      color: frog?.color || "#4a7c59",
      timestamp: new Date().toLocaleString(),
      notes: result.callDescription || result.distinguishing || "",
      funFact: result.funFact,
    }, ...prev]);
  };

  const playExampleCall = (frog) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setPlayingId(frog.name);
    const utt = new SpeechSynthesisUtterance(`Example call for the ${frog.name}: ${frog.call}`);
    utt.rate = 0.9;
    utt.onend = () => setPlayingId(null);
    window.speechSynthesis.speak(utt);
  };

  const frogFor = r => r?.species ? FROGS.find(f => f.name === r.species) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#060f08", fontFamily: "'Georgia',serif", color: "#e8f5e9", maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .tab-btn { flex:1; padding:12px 0; border:none; background:transparent; color:#4a7c59; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; border-bottom:2px solid transparent; }
        .tab-btn.active { color:#a5d6a7; border-bottom:2px solid #4caf50; }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-up { animation:fadeUp .4s ease forwards; }
        .pulse-ring { animation:pulseRing 1.5s ease-out infinite; }
      `}</style>

      {/* API Key warning */}
      {noApiKey && (
        <div style={{ background: "#b71c1c", padding: "10px 16px", fontSize: 12, color: "#ffcdd2", fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
          ⚠️ Missing API key — add <strong>VITE_ANTHROPIC_API_KEY</strong> to your Vercel environment variables
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "28px 24px 14px", background: "linear-gradient(180deg,#0a1f0c,#060f08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 34 }}>🐸</div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#c8e6c9", lineHeight: 1, fontWeight: 900 }}>Florida Frog Finder</h1>
            <p style={{ fontSize: 10, color: "#4a7c59", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginTop: 3 }}>19 Species · Sound + Vision AI</p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#66bb6a", fontFamily: "'DM Sans',sans-serif" }}>{journal.length}</div>
            <div style={{ fontSize: 9, color: "#2e7d32", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif" }}>LOGGED</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1a2e1c", background: "#060f08", position: "sticky", top: 0, zIndex: 10 }}>
        {[["sound","🎙️ Sound"],["photo","📷 Photo"],["journal","📓 Journal"]].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 20px 80px" }}>

        {/* ── SOUND ── */}
        {tab === "sound" && (
          <div className="fade-up">
            <p style={{ fontSize: 13, color: "#66bb6a", lineHeight: 1.6, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
              Hold your phone near the frog. Record up to 30 seconds, then tap Identify.
            </p>

            <Spectrogram analyserRef={analyserRef} isRecording={isRecording} audioData={audioData} />

            {(isRecording || recSeconds > 0) && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "0 4px" }}>
                <span style={{ fontSize: 12, color: isRecording ? "#ef5350" : "#66bb6a", fontFamily: "monospace" }}>
                  {isRecording ? `● REC ${formatTime(recSeconds)}` : `✓ ${formatTime(recSeconds)}s recorded`}
                </span>
                {isRecording && (
                  <div style={{ width: 100, height: 4, background: "#1b5e20", borderRadius: 2 }}>
                    <div style={{ width: `${(recSeconds / 30) * 100}%`, height: "100%", background: "#ef5350", borderRadius: 2, transition: "width .9s linear" }} />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", margin: "24px 0 20px" }}>
              <div style={{ position: "relative" }}>
                {isRecording && <div className="pulse-ring" style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "2px solid #ef5350", pointerEvents: "none" }} />}
                <button onClick={isRecording ? stopRecording : startRecording} style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: isRecording ? "radial-gradient(circle,#c62828,#b71c1c)" : "radial-gradient(circle,#2e7d32,#1b5e20)",
                  border: `3px solid ${isRecording ? "#ef9a9a" : "#4caf50"}`,
                  cursor: "pointer", transition: "all .2s",
                  boxShadow: `0 0 30px ${isRecording ? "rgba(239,83,80,.4)" : "rgba(76,175,80,.3)"}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2
                }}>
                  <span style={{ fontSize: 22 }}>{isRecording ? "⏹" : "🎙️"}</span>
                  <span style={{ fontSize: 9, color: "white", fontFamily: "'DM Sans',sans-serif", letterSpacing: "1px" }}>{isRecording ? "STOP" : "LISTEN"}</span>
                </button>
              </div>
            </div>

            {audioData && !isRecording && (
              <button onClick={identifySound} disabled={loading} style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "linear-gradient(135deg,#2e7d32,#43a047)",
                border: "none", color: "white", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                boxShadow: "0 4px 20px rgba(46,125,50,.5)", marginBottom: 16,
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? "🔍 Analyzing..." : "🔍 Identify Call"}
              </button>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 36, height: 36, border: "3px solid #1b5e20", borderTop: "3px solid #66bb6a", borderRadius: "50%", margin: "0 auto 10px", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "#66bb6a", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>Analyzing call patterns…</p>
              </div>
            )}

            {error && (
              <div style={{ padding: "12px 14px", background: "rgba(183,28,28,.2)", border: "1px solid #c62828", borderRadius: 10, marginBottom: 12 }}>
                <p style={{ color: "#ef9a9a", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>⚠️ {error}</p>
              </div>
            )}

            {soundResult && <ResultCard result={soundResult} frog={frogFor(soundResult)} onPlayCall={playExampleCall} playingId={playingId} type="sound" />}
          </div>
        )}

        {/* ── PHOTO ── */}
        {tab === "photo" && (
          <div className="fade-up">
            <p style={{ fontSize: 13, color: "#66bb6a", lineHeight: 1.6, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
              Take a photo or upload an image of a frog for AI identification.
            </p>

            {!image ? (
              <div onClick={() => fileRef.current?.click()} style={{
                border: "2px dashed #2e7d32", borderRadius: 18, padding: "48px 24px",
                textAlign: "center", cursor: "pointer", background: "rgba(27,94,32,.1)"
              }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
                <p style={{ color: "#a5d6a7", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>Upload or take a photo</p>
                <p style={{ color: "#4a7c59", fontSize: 12, fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>Tap to browse · Camera supported on mobile</p>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => handlePhoto(e.target.files[0])} style={{ display: "none" }} />
              </div>
            ) : (
              <div style={{ borderRadius: 18, overflow: "hidden", position: "relative", boxShadow: "0 8px 40px rgba(0,0,0,.6)" }}>
                <img src={image} alt="frog" style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }} />
                <button onClick={() => { setImage(null); setImgB64(null); setPhotoResult(null); }} style={{
                  position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.75)",
                  border: "none", borderRadius: "50%", width: 34, height: 34, color: "white", cursor: "pointer", fontSize: 18
                }}>×</button>
              </div>
            )}

            {image && !loading && (
              <button onClick={identifyPhoto} style={{
                width: "100%", padding: "14px", borderRadius: 14, marginTop: 14,
                background: "linear-gradient(135deg,#2e7d32,#43a047)",
                border: "none", color: "white", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                boxShadow: "0 4px 20px rgba(46,125,50,.5)"
              }}>🔍 Identify Frog</button>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 36, height: 36, border: "3px solid #1b5e20", borderTop: "3px solid #66bb6a", borderRadius: "50%", margin: "0 auto 10px", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "#66bb6a", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>Analyzing photo…</p>
              </div>
            )}

            {error && (
              <div style={{ padding: "12px 14px", background: "rgba(183,28,28,.2)", border: "1px solid #c62828", borderRadius: 10, marginTop: 12 }}>
                <p style={{ color: "#ef9a9a", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>⚠️ {error}</p>
              </div>
            )}

            {photoResult && <div style={{ marginTop: 16 }}><ResultCard result={photoResult} frog={frogFor(photoResult)} onPlayCall={playExampleCall} playingId={playingId} type="photo" /></div>}
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab === "journal" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#c8e6c9" }}>Field Journal</h2>
              {journal.length > 0 && (
                <button onClick={() => setJournal([])} style={{ fontSize: 11, color: "#4a7c59", background: "none", border: "1px solid #1b5e20", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Clear all
                </button>
              )}
            </div>

            {journal.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#2e7d32" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📓</div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>No sightings yet.<br />Identify a frog to start your journal!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {journal.map(e => (
                  <div key={e.id} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(27,94,32,.15)", border: `1px solid ${e.color}44` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#c8e6c9", fontFamily: "'DM Sans',sans-serif" }}>{e.species}</div>
                        <div style={{ fontSize: 11, color: "#66bb6a", fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>{e.scientific}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${confColor(e.confidence)}22`, color: confColor(e.confidence), fontFamily: "'DM Sans',sans-serif" }}>
                          {e.confidencePercent}%
                        </span>
                        <span style={{ fontSize: 12 }}>{e.type === "sound" ? "🎙️" : "📷"}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#4a7c59", fontFamily: "'DM Sans',sans-serif" }}>🕐 {e.timestamp}</div>
                    {e.notes && <div style={{ fontSize: 12, color: "#81c784", fontFamily: "'DM Sans',sans-serif", marginTop: 6, lineHeight: 1.5 }}>{e.notes}</div>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "#c8e6c9", marginBottom: 12 }}>
                Species Checklist &nbsp;
                <span style={{ fontSize: 12, color: "#66bb6a", fontFamily: "'DM Sans',sans-serif", fontStyle: "normal" }}>
                  {[...new Set(journal.map(e => e.species))].length}/{FROGS.length} found
                </span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {FROGS.map(f => {
                  const found = journal.some(e => e.species === f.name);
                  return (
                    <div key={f.name} style={{ padding: "8px 10px", borderRadius: 10, background: found ? `${f.color}22` : "rgba(18,30,20,.5)", border: `1px solid ${found ? f.color + "55" : "rgba(46,125,50,.2)"}` }}>
                      <div style={{ fontSize: 11, color: found ? "#c8e6c9" : "#4a7c59", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.3 }}>
                        {found ? "✓ " : ""}{f.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}