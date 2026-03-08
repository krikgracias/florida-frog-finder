import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ── Species Data ──────────────────────────────────────────────────────────────
const FROGS = [
  { name:"American Bullfrog",          sci:"Lithobates catesbeianus",       color:"#4a7c59", file:"american-bullfrog",          habitat:"Permanent ponds, lakes, slow rivers",          size:'3.5–8"',    native:true  },
  { name:"Barking Treefrog",           sci:"Hyla gratiosa",                 color:"#558b2f", file:"barking-treefrog",            habitat:"Sandy scrub, pine flatwoods near water",       size:'2–2.75"',   native:true  },
  { name:"Bird-voiced Treefrog",       sci:"Hyla avivoca",                  color:"#7cb342", file:"bird-voiced-treefrog",        habitat:"Wooded swamps near rivers, panhandle",         size:'1.25–2"',   native:true  },
  { name:"Bronze Frog",                sci:"Lithobates clamitans",          color:"#a1887f", file:"bronze-frog",                 habitat:"Streams, springs, seepage areas",              size:'2–3.5"',    native:true  },
  { name:"Cane Toad",                  sci:"Rhinella marina",               color:"#795548", file:"cane-toad",                   habitat:"Urban areas, disturbed habitats (invasive)",   size:'4–9"',      native:false },
  { name:"Carpenter Frog",             sci:"Lithobates virgatipes",         color:"#a1887f", file:"carpenter-frog",              habitat:"Sphagnum bogs, blackwater streams",            size:'1.6–2.6"',  native:true  },
  { name:"Coastal Plain Cricket Frog", sci:"Acris gryllus gryllus",         color:"#8bc34a", file:"coastal-plain-cricket-frog",  habitat:"Edges of ponds, streams, ditches",             size:'0.6–1.5"',  native:true  },
  { name:"Cope's Gray Treefrog",       sci:"Hyla chrysoscelis",             color:"#78909c", file:"copes-gray-treefrog",         habitat:"Trees near permanent water, northern FL",      size:'1.5–2.5"',  native:true  },
  { name:"Cuban Treefrog",             sci:"Osteopilus septentrionalis",    color:"#9e9d24", file:"cuban-treefrog",              habitat:"Buildings, trees, urban areas (invasive)",     size:'1.5–5.5"',  native:false },
  { name:"Eastern Cricket Frog",       sci:"Acris crepitans",               color:"#8bc34a", file:"eastern-cricket-frog",        habitat:"Edges of ponds and streams, panhandle",        size:'0.6–1.5"',  native:true  },
  { name:"Eastern Narrowmouth Toad",   sci:"Gastrophryne carolinensis",     color:"#616161", file:"eastern-narrowmouth-toad",    habitat:"Under debris, moist forests near water",       size:'0.75–1.5"', native:true  },
  { name:"Eastern Spadefoot",          sci:"Scaphiopus holbrookii",         color:"#5d4037", file:"eastern-spadefoot",           habitat:"Sandy uplands, emerges after heavy rain",      size:'1.75–3.25"',native:true  },
  { name:"Florida Bog Frog",           sci:"Lithobates okaloosae",          color:"#2e7d32", file:"florida-bog-frog",            habitat:"Seepage bogs, NW Florida panhandle only",      size:'1.4–1.8"',  native:true  },
  { name:"Florida Cricket Frog",       sci:"Acris gryllus dorsalis",        color:"#8bc34a", file:"florida-cricket-frog",        habitat:"Edges of ponds and streams statewide",         size:'0.6–1.5"',  native:true  },
  { name:"Fowler's Toad",              sci:"Anaxyrus fowleri",              color:"#8d6e63", file:"fowlers-toad",                habitat:"Sandy areas, gardens, panhandle region",       size:'2–3.75"',   native:true  },
  { name:"Gopher Frog",                sci:"Lithobates capito",             color:"#8d6e63", file:"gopher-frog",                 habitat:"Longleaf pine, gopher tortoise burrows",       size:'2.6–3.75"', native:true  },
  { name:"Greenhouse Frog",            sci:"Eleutherodactylus planirostris",color:"#795548", file:"greenhouse-frog",             habitat:"Gardens, greenhouses, leaf litter (invasive)", size:'0.6–1.3"',  native:false },
  { name:"Green Treefrog",             sci:"Hyla cinerea",                  color:"#6aab3a", file:"green-treefrog",              habitat:"Vegetation near ponds, ditches, swamps",       size:'1.25–2.5"', native:true  },
  { name:"Little Grass Frog",          sci:"Pseudacris ocularis",           color:"#9ccc65", file:"little-grass-frog",           habitat:"Grassy edges of shallow wetlands",             size:'0.4–0.6"',  native:true  },
  { name:"Oak Toad",                   sci:"Anaxyrus quercicus",            color:"#78909c", file:"oak-toad",                    habitat:"Sandy pinelands, scrub, longleaf pine",        size:'0.75–1.3"', native:true  },
  { name:"Ornate Chorus Frog",         sci:"Pseudacris ornata",             color:"#66bb6a", file:"ornate-chorus-frog",          habitat:"Flatwoods, grassy ephemeral ponds, winter",    size:'0.9–1.5"',  native:true  },
  { name:"Pig Frog",                   sci:"Lithobates grylio",             color:"#37474f", file:"pig-frog",                    habitat:"Lily pad marshes, cypress swamps, Everglades", size:'3.25–6.5"', native:true  },
  { name:"Pine Barrens Treefrog",      sci:"Hyla andersonii",              color:"#558b2f", file:"pine-barrens-treefrog",       habitat:"Seepage bogs, pitcher plant bogs, panhandle",  size:'1.25–2"',   native:true  },
  { name:"Pine Woods Treefrog",        sci:"Hyla femoralis",                color:"#795548", file:"pine-woods-treefrog",         habitat:"Pine flatwoods, sandy pinelands statewide",    size:'1–1.75"',   native:true  },
  { name:"River Frog",                 sci:"Lithobates heckscheri",         color:"#546e7a", file:"river-frog",                  habitat:"Swampy river margins, permanent water",        size:'3.25–5.25"',native:true  },
  { name:"Southern Chorus Frog",       sci:"Pseudacris nigrita",            color:"#78909c", file:"southern-chorus-frog",        habitat:"Pine flatwoods, sandy soil, winter caller",    size:'0.75–1.25"',native:true  },
  { name:"Southern Cricket Frog",      sci:"Acris gryllus",                 color:"#9ccc65", file:"southern-cricket-frog",       habitat:"Edges of any freshwater body, statewide",      size:'0.6–1.5"',  native:true  },
  { name:"Southern Leopard Frog",      sci:"Lithobates sphenocephalus",     color:"#33691e", file:"southern-leopard-frog",       habitat:"Nearly any freshwater, very adaptable",        size:'2–3.5"',    native:true  },
  { name:"Southern Toad",              sci:"Anaxyrus terrestris",           color:"#8d6e63", file:"southern-toad",               habitat:"Sandy soil, suburban yards, statewide",        size:'1.5–3.5"',  native:true  },
  { name:"Spring Peeper",              sci:"Pseudacris crucifer",           color:"#a5d6a7", file:"spring-peeper",               habitat:"Forests near wetlands, northern Florida",      size:'0.75–1.5"', native:true  },
  { name:"Squirrel Treefrog",          sci:"Hyla squirella",                color:"#8bc34a", file:"squirrel-treefrog",           habitat:"Gardens, trees, shrubs near water, statewide", size:'0.9–1.6"',  native:true  },
  { name:"Upland Chorus Frog",         sci:"Pseudacris feriarum",           color:"#80cbc4", file:"upland-chorus-frog",          habitat:"Upland fields, woodland edges, panhandle",     size:'0.75–1.5"', native:true  },
];

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const PHOTO_SYSTEM = `You are an expert herpetologist specializing in Florida's frog and toad species.
Known Florida species: ${FROGS.map(f=>`${f.name} (${f.sci})`).join(', ')}
Respond ONLY in valid JSON (no markdown):
{
  "identified": true or false,
  "species": "exact name or null",
  "confidence": "High/Medium/Low",
  "confidencePercent": 85,
  "habitat": "habitat description",
  "size": "size range",
  "distinguishing": "key features seen in this image",
  "funFact": "one interesting fact",
  "conservationStatus": "status",
  "native": true or false,
  "notes": "additional notes"
}`;

// ── Audio Fingerprinting Engine ───────────────────────────────────────────────
class AudioFingerprinter {
  constructor() { this.referenceProfiles = new Map(); }

  extractProfile(audioBuffer) {
    const channel = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const segmentCount = 16;
    const segmentLen = Math.floor(channel.length / segmentCount);
    const profiles = [];
    for (let s = 0; s < segmentCount; s++) {
      profiles.push(this.spectralBands(channel.slice(s * segmentLen, (s+1) * segmentLen), sampleRate));
    }
    const bands = profiles[0].length;
    const mean = new Array(bands).fill(0);
    const variance = new Array(bands).fill(0);
    profiles.forEach(p => p.forEach((v,i) => mean[i] += v / segmentCount));
    profiles.forEach(p => p.forEach((v,i) => variance[i] += Math.pow(v - mean[i], 2) / segmentCount));
    const peakBand = mean.indexOf(Math.max(...mean));
    const lowEnergy = mean.slice(0, bands/2).reduce((a,b)=>a+b,0);
    const highEnergy = mean.slice(bands/2).reduce((a,b)=>a+b,0);
    const freqRatio = highEnergy / (lowEnergy + 0.001);
    const temporalVar = variance.reduce((a,b)=>a+b,0) / bands;
    return { mean, variance, peakBand, freqRatio, temporalVar, bands };
  }

  spectralBands(samples, sampleRate) {
    const N = 512;
    const data = new Float32Array(N);
    for (let i = 0; i < N && i < samples.length; i++) data[i] = samples[i];
    const numBands = 32;
    const energies = new Array(numBands).fill(0);
    for (let k = 1; k <= N/2; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) { const a=(2*Math.PI*k*n)/N; re+=data[n]*Math.cos(a); im-=data[n]*Math.sin(a); }
      const power = (re*re + im*im)/(N*N);
      energies[Math.min(numBands-1, Math.floor((k/(N/2))*numBands))] += power;
    }
    const max = Math.max(...energies, 1e-10);
    return energies.map(e => e/max);
  }

  compare(a, b) {
    const bands = a.mean.length;
    let dot=0,magA=0,magB=0;
    for(let i=0;i<bands;i++){dot+=a.mean[i]*b.mean[i];magA+=a.mean[i]**2;magB+=b.mean[i]**2;}
    const cosine=dot/(Math.sqrt(magA*magB)+1e-10);
    let sumA=0,sumB=0;
    for(let i=0;i<bands;i++){sumA+=a.mean[i];sumB+=b.mean[i];}
    const avgA=sumA/bands,avgB=sumB/bands;
    let num=0,denA=0,denB=0;
    for(let i=0;i<bands;i++){num+=(a.mean[i]-avgA)*(b.mean[i]-avgB);denA+=(a.mean[i]-avgA)**2;denB+=(b.mean[i]-avgB)**2;}
    const pearson=num/(Math.sqrt(denA*denB)+1e-10);
    const peakScore=1-Math.abs(a.peakBand-b.peakBand)/bands;
    const ratioSim=1-Math.min(1,Math.abs(a.freqRatio-b.freqRatio)/(Math.max(a.freqRatio,b.freqRatio)+0.001));
    const varSim=1-Math.min(1,Math.abs(a.temporalVar-b.temporalVar)/(Math.max(a.temporalVar,b.temporalVar)+0.001));
    return cosine*0.35+pearson*0.25+peakScore*0.2+ratioSim*0.1+varSim*0.1;
  }

  async loadReference(frog) {
    if(this.referenceProfiles.has(frog.file)) return true;
    try {
      const res=await fetch(`/calls/${frog.file}.mp3`);
      if(!res.ok) return false;
      const ctx=new (window.AudioContext||window.webkitAudioContext)();
      const buf=await ctx.decodeAudioData(await res.arrayBuffer());
      await ctx.close();
      this.referenceProfiles.set(frog.file, this.extractProfile(buf));
      return true;
    } catch(e){ return false; }
  }

  async match(blob) {
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const buf=await ctx.decodeAudioData(await blob.arrayBuffer());
    await ctx.close();
    const rec=this.extractProfile(buf);
    return FROGS
      .filter(f=>this.referenceProfiles.has(f.file))
      .map(f=>({frog:f, score:this.compare(rec,this.referenceProfiles.get(f.file))}))
      .sort((a,b)=>b.score-a.score);
  }
}

const fingerprinter = new AudioFingerprinter();

// ── Helpers ───────────────────────────────────────────────────────────────────
const confColor  = c  => c==="High"?"#4caf50":c==="Medium"?"#ffb300":"#ef5350";
const formatTime = s  => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
const toConf     = sc => sc>0.70?"High":sc>0.55?"Medium":"Low";
const toPct      = sc => Math.min(99,Math.round(sc*115));
const timeAgo    = ts => {
  const s=Math.floor((Date.now()-new Date(ts))/1000);
  if(s<60) return `${s}s ago`;
  if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

// ── Spectrogram ───────────────────────────────────────────────────────────────
function Spectrogram({ analyserRef, isRecording, audioData }) {
  const canvasRef=useRef(null), animRef=useRef(null), colRef=useRef(0);
  useEffect(()=>{
    const c=canvasRef.current; if(!c) return;
    c.getContext("2d").fillStyle="#020f06";
    c.getContext("2d").fillRect(0,0,c.width,c.height);
  },[]);
  useEffect(()=>{
    if(!isRecording||!analyserRef.current) return;
    const c=canvasRef.current,ctx=c.getContext("2d"),W=c.width,H=c.height;
    const buf=new Uint8Array(analyserRef.current.frequencyBinCount);
    const draw=()=>{
      animRef.current=requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(buf);
      const sh=H/buf.length;
      for(let i=0;i<buf.length;i++){
        const v=buf[i]/255,y=H-i*sh;
        ctx.fillStyle=`rgb(${Math.floor(v<0.5?0:(v-0.5)*400)},${Math.floor(v<0.5?v*360:180-(v-0.5)*120)},${Math.floor(v<0.5?v*160:0)})`;
        ctx.fillRect(colRef.current,y,2,sh+1);
      }
      colRef.current=(colRef.current+2)%W;
      ctx.fillStyle="rgba(200,255,200,0.1)"; ctx.fillRect(colRef.current,0,1,H);
    };
    draw(); return ()=>cancelAnimationFrame(animRef.current);
  },[isRecording]);
  useEffect(()=>{
    if(isRecording||!audioData?.length) return;
    const c=canvasRef.current,ctx=c.getContext("2d"),W=c.width,H=c.height;
    ctx.fillStyle="#020f06"; ctx.fillRect(0,0,W,H);
    const step=Math.max(1,Math.floor(audioData.length/W));
    ctx.strokeStyle="#4caf50"; ctx.lineWidth=1.5; ctx.beginPath();
    for(let x=0;x<W;x++){const v=(audioData[x*step]||0)/255; x===0?ctx.moveTo(x,H-v*H):ctx.lineTo(x,H-v*H);}
    ctx.stroke();
    for(let x=0;x<W;x++){const v=(audioData[x*step]||0)/255; ctx.fillStyle=`hsla(${120+v*60},80%,45%,${v*0.5})`; ctx.fillRect(x,H-v*H*0.8,2,v*H*0.8);}
  },[isRecording,audioData]);
  return (
    <div style={{position:"relative",borderRadius:12,overflow:"hidden",background:"#020f06",border:"1px solid #1b5e20"}}>
      <canvas ref={canvasRef} width={440} height={120} style={{width:"100%",height:120,display:"block"}}/>
      <div style={{position:"absolute",top:6,left:8,fontSize:9,color:"#2e7d32",fontFamily:"monospace",letterSpacing:"1px"}}>
        {isRecording?"● LIVE":audioData?.length?"RECORDED":"SPECTROGRAM"}
      </div>
      <div style={{position:"absolute",right:6,top:6,display:"flex",flexDirection:"column",gap:2}}>
        {["20k","10k","5k","1k","100"].map(l=><div key={l} style={{fontSize:7,color:"#2e7d32",fontFamily:"monospace"}}>{l}Hz</div>)}
      </div>
    </div>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onAuth }) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [username,setUsername]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [message,setMessage]=useState(null);

  const handleEmail = async () => {
    setLoading(true); setError(null);
    try {
      if(mode==="login") {
        const {data,error}=await supabase.auth.signInWithPassword({email,password});
        if(error) throw error;
        onAuth(data.user);
      } else {
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{username}}});
        if(error) throw error;
        if(data.user && !data.session) {
          setMessage("Check your email for a confirmation link!");
        } else {
          // Create profile
          if(data.user) {
            await supabase.from("profiles").upsert({id:data.user.id,username:username||email.split("@")[0]});
            onAuth(data.user);
          }
        }
      }
    } catch(e){ setError(e.message); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const {error}=await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:window.location.origin}
    });
    if(error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0a1a0c",border:"1px solid #2e7d32",borderRadius:24,padding:28,width:"100%",maxWidth:360,position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#4a7c59",fontSize:20,cursor:"pointer"}}>×</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:36,marginBottom:8}}>🐸</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#c8e6c9"}}>{mode==="login"?"Welcome back":"Join the community"}</h2>
          <p style={{fontSize:12,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Save sightings · Share discoveries · See the map</p>
        </div>

        {message?(
          <div style={{padding:"16px",background:"rgba(76,175,80,.15)",border:"1px solid #4caf50",borderRadius:12,textAlign:"center"}}>
            <p style={{color:"#a5d6a7",fontFamily:"'DM Sans',sans-serif",fontSize:14}}>{message}</p>
          </div>
        ):(
          <>
            <button onClick={handleGoogle} disabled={loading} style={{
              width:"100%",padding:"12px",borderRadius:12,marginBottom:16,
              background:"white",border:"none",color:"#333",fontSize:14,fontWeight:600,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>

            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{flex:1,height:1,background:"#1b5e20"}}/>
              <span style={{fontSize:11,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif"}}>or</span>
              <div style={{flex:1,height:1,background:"#1b5e20"}}/>
            </div>

            {mode==="signup"&&(
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,marginBottom:10,background:"#0e1f10",border:"1px solid #2e7d32",color:"#c8e6c9",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
            )}
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,marginBottom:10,background:"#0e1f10",border:"1px solid #2e7d32",color:"#c8e6c9",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,marginBottom:16,background:"#0e1f10",border:"1px solid #2e7d32",color:"#c8e6c9",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>

            {error&&<p style={{color:"#ef9a9a",fontSize:12,fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>⚠️ {error}</p>}

            <button onClick={handleEmail} disabled={loading||!email||!password} style={{
              width:"100%",padding:"13px",borderRadius:12,
              background:"linear-gradient(135deg,#2e7d32,#43a047)",
              border:"none",color:"white",fontSize:14,fontWeight:600,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
              opacity:loading||!email||!password?0.6:1
            }}>{loading?"...":(mode==="login"?"Sign In":"Create Account")}</button>

            <p style={{textAlign:"center",marginTop:14,fontSize:12,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif"}}>
              {mode==="login"?"No account? ":"Already have one? "}
              <span onClick={()=>{setMode(mode==="login"?"signup":"login");setError(null);}} style={{color:"#66bb6a",cursor:"pointer",textDecoration:"underline"}}>
                {mode==="login"?"Sign up":"Log in"}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Listen Library ────────────────────────────────────────────────────────────
function ListenLibrary({ playingRef, onPlay }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = FROGS.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "native" && f.native) || (filter === "invasive" && !f.native);
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search species…"
        style={{
          width:"100%", padding:"10px 14px", borderRadius:12, marginBottom:10,
          background:"#0e1f10", border:"1px solid #2e7d32", color:"#c8e6c9",
          fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none"
        }}
      />
      {/* Filter */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[["all","All 32"],["native","Native"],["invasive","Invasive"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{
            padding:"5px 12px", borderRadius:16, fontSize:11, fontFamily:"'DM Sans',sans-serif",
            cursor:"pointer", transition:"all .2s",
            background:filter===id?"rgba(76,175,80,.2)":"transparent",
            border:`1px solid ${filter===id?"#4caf50":"#2e7d32"}`,
            color:filter===id?"#a5d6a7":"#4a7c59"
          }}>{label}</button>
        ))}
        <div style={{marginLeft:"auto",fontSize:11,color:"#2e7d32",fontFamily:"'DM Sans',sans-serif",alignSelf:"center"}}>
          {filtered.length} species
        </div>
      </div>

      {/* Species list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(frog => {
          const isPlaying = playingRef === frog.file;
          return (
            <div key={frog.file} style={{
              borderRadius:14, padding:"12px 14px",
              background: isPlaying ? `${frog.color}18` : "rgba(27,94,32,.12)",
              border: `1px solid ${isPlaying ? frog.color+"66" : frog.color+"33"}`,
              transition:"all .25s"
            }}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {/* Play button */}
                <button onClick={()=>onPlay(frog)} style={{
                  width:42, height:42, borderRadius:"50%", flexShrink:0,
                  background: isPlaying ? `${frog.color}` : "rgba(27,94,32,.4)",
                  border: `2px solid ${isPlaying ? frog.color : "#2e7d32"}`,
                  color:"white", cursor:"pointer", fontSize:16,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow: isPlaying ? `0 0 16px ${frog.color}66` : "none",
                  transition:"all .25s"
                }}>
                  {isPlaying ? "⏹" : "▶"}
                </button>

                {/* Info */}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#c8e6c9",fontFamily:"'DM Sans',sans-serif",lineHeight:1.2}}>{frog.name}</div>
                  <div style={{fontSize:10,fontStyle:"italic",color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{frog.sci}</div>
                  <div style={{fontSize:10,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{frog.habitat}</div>
                </div>

                {/* Size + native badge */}
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:11,color:"#a5d6a7",fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>{frog.size}</div>
                  {!frog.native && (
                    <div style={{fontSize:9,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif",background:"rgba(255,138,101,.1)",padding:"1px 6px",borderRadius:8,border:"1px solid rgba(255,138,101,.3)"}}>invasive</div>
                  )}
                </div>
              </div>

              {/* Playing indicator bar */}
              {isPlaying && (
                <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:2,background:"#1b5e20",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",background:`linear-gradient(90deg,${frog.color},#66bb6a)`,animation:"playbar 3s linear infinite",backgroundSize:"200% 100%"}}/>
                  </div>
                  <span style={{fontSize:9,color:frog.color,fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px"}}>PLAYING</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{textAlign:"center",padding:"30px 0",color:"#2e7d32"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13}}>No species match your search.</p>
        </div>
      )}
    </div>
  );
}

// ── Florida Map ───────────────────────────────────────────────────────────────
function FloridaMap({ sightings }) {
  const withCoords = sightings.filter(s => s.latitude && s.longitude);
  // Florida center
  const center = [27.8, -83.5];

  return (
    <div style={{borderRadius:16,overflow:"hidden",border:"1px solid #2e7d32",marginBottom:20}}>
      <div style={{padding:"10px 14px",background:"#0a1f0c",borderBottom:"1px solid #1b5e20",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,color:"#66bb6a",letterSpacing:"2px",fontFamily:"'DM Sans',sans-serif"}}>🗺️ SIGHTINGS MAP</span>
        <span style={{fontSize:11,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif"}}>{withCoords.length} with location</span>
      </div>
      <div style={{height:380,position:"relative"}}>
        <MapContainer
          center={center}
          zoom={6}
          style={{height:"100%",width:"100%"}}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
          {withCoords.map((s,i) => {
            const frog = FROGS.find(f=>f.name===s.species);
            const color = frog?.color || "#4caf50";
            return (
              <CircleMarker
                key={s.id||i}
                center={[s.latitude, s.longitude]}
                radius={8}
                pathOptions={{color:"white",weight:1.5,fillColor:color,fillOpacity:0.9}}
              >
                <Popup>
                  <div style={{fontFamily:"sans-serif",minWidth:140}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{s.species}</div>
                    <div style={{fontSize:11,color:"#555",fontStyle:"italic",marginBottom:4}}>{frog?.sci}</div>
                    <div style={{fontSize:11,color:"#333"}}>👤 {s.username||"anonymous"}</div>
                    <div style={{fontSize:11,color:"#333"}}>📊 {s.confidence_pct}% {s.confidence}</div>
                    <div style={{fontSize:10,color:"#888",marginTop:3}}>{s.method==="sound"?"🎙️ Sound ID":"📷 Photo ID"}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        {withCoords.length===0&&(
          <div style={{position:"absolute",bottom:12,left:0,right:0,textAlign:"center",zIndex:1000,pointerEvents:"none"}}>
            <div style={{display:"inline-block",padding:"6px 14px",background:"rgba(6,15,8,.8)",borderRadius:20,border:"1px solid #2e7d32"}}>
              <p style={{color:"#66bb6a",fontSize:11,fontFamily:"'DM Sans',sans-serif",margin:0}}>Enable location when identifying to add pins to the map</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sighting Card ─────────────────────────────────────────────────────────────
function SightingCard({ sighting: e, frog, isOwner, onDelete, onCorrect }) {
  const [showCorrect, setShowCorrect] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(e.species);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCorrect = () => {
    if (selectedSpecies !== e.species) onCorrect(selectedSpecies);
    setShowCorrect(false);
  };

  return (
    <div style={{borderRadius:14,overflow:"hidden",background:"rgba(27,94,32,.15)",border:`1px solid ${frog?.color||"#2e7d32"}44`}}>
      {e.photo_url&&<img src={e.photo_url} alt={e.species} style={{width:"100%",maxHeight:180,objectFit:"cover",display:"block"}}/>}
      <div style={{padding:"11px 13px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:"#c8e6c9",fontFamily:"'DM Sans',sans-serif"}}>{e.species}</div>
            <div style={{fontSize:10,color:"#66bb6a",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>{frog?.sci||e.scientific}</div>
            {e.username&&<div style={{fontSize:10,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>👤 {e.username}</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:`${confColor(e.confidence)}22`,color:confColor(e.confidence),fontFamily:"'DM Sans',sans-serif"}}>{e.confidence_pct}%</span>
            <span style={{fontSize:10}}>{e.method==="sound"?"🎙️":"📷"} <span style={{color:"#2e7d32",fontSize:9}}>{timeAgo(e.created_at)}</span></span>
          </div>
        </div>
        {e.latitude&&<div style={{fontSize:10,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif",marginBottom:isOwner?6:0}}>📍 {e.latitude.toFixed(3)}, {e.longitude.toFixed(3)}</div>}

        {isOwner&&(
          <>
            {showCorrect?(
              <div style={{marginTop:6}}>
                <div style={{fontSize:10,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>Select the correct species:</div>
                <select value={selectedSpecies} onChange={ev=>setSelectedSpecies(ev.target.value)} style={{
                  width:"100%",padding:"8px 10px",borderRadius:8,marginBottom:6,
                  background:"#0e1f10",border:"1px solid #2e7d32",color:"#c8e6c9",
                  fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none"
                }}>
                  {FROGS.map(f=><option key={f.name} value={f.name}>{f.name}</option>)}
                </select>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={handleCorrect} style={{flex:1,padding:"7px",borderRadius:8,background:"rgba(76,175,80,.2)",border:"1px solid #4caf50",color:"#a5d6a7",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>✓ Save</button>
                  <button onClick={()=>setShowCorrect(false)} style={{padding:"7px 12px",borderRadius:8,background:"transparent",border:"1px solid #2e7d32",color:"#4a7c59",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                </div>
              </div>
            ):(
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={()=>setShowCorrect(true)} style={{flex:1,padding:"6px",borderRadius:8,background:"rgba(27,94,32,.3)",border:"1px solid #2e7d32",color:"#66bb6a",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>✏️ Wrong species?</button>
                {confirmDelete?(
                  <>
                    <button onClick={()=>onDelete(e.id)} style={{flex:1,padding:"6px",borderRadius:8,background:"rgba(183,28,28,.3)",border:"1px solid #c62828",color:"#ef9a9a",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>Confirm delete</button>
                    <button onClick={()=>setConfirmDelete(false)} style={{padding:"6px 10px",borderRadius:8,background:"transparent",border:"1px solid #2e7d32",color:"#4a7c59",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>✕</button>
                  </>
                ):(
                  <button onClick={()=>setConfirmDelete(true)} style={{padding:"6px 10px",borderRadius:8,background:"rgba(183,28,28,.12)",border:"1px solid #c6282844",color:"#ef5350",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>🗑️</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Community Feed ────────────────────────────────────────────────────────────
function CommunityFeed({ sightings, currentUser, onDelete, onCorrect }) {
  const [filter,setFilter]=useState("all");
  const filtered = filter==="all" ? sightings : sightings.filter(s=>s.user_id===currentUser?.id);

  if(!sightings.length) return (
    <div style={{textAlign:"center",padding:"40px 0",color:"#2e7d32"}}>
      <div style={{fontSize:40,marginBottom:10}}>🌿</div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13}}>No community sightings yet.<br/>Be the first to identify a frog!</p>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["all","mine"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:"6px 14px",borderRadius:20,fontSize:11,fontFamily:"'DM Sans',sans-serif",
            letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",
            background:filter===f?"rgba(76,175,80,.2)":"transparent",
            border:`1px solid ${filter===f?"#4caf50":"#2e7d32"}`,
            color:filter===f?"#a5d6a7":"#4a7c59"
          }}>{f==="all"?"All Sightings":"My Sightings"}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(s=>{
          const frog=FROGS.find(f=>f.name===s.species);
          const isOwner=currentUser&&s.user_id===currentUser.id;
          return (
            <SightingCard key={s.id} sighting={s} frog={frog} isOwner={isOwner}
              onDelete={onDelete} onCorrect={(newSpecies)=>onCorrect(s.id,newSpecies)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function Leaderboard({ sightings }) {
  const counts = {};
  sightings.forEach(s => {
    const key = s.username || "anonymous";
    if(!counts[key]) counts[key]={username:key, total:0, species:new Set()};
    counts[key].total++;
    counts[key].species.add(s.species);
  });
  const sorted = Object.values(counts).sort((a,b)=>b.species.size-a.species.size).slice(0,10);
  const medals = ["🥇","🥈","🥉"];

  if(!sorted.length) return (
    <div style={{textAlign:"center",padding:"30px 0",color:"#2e7d32"}}>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Leaderboard fills up as people find frogs!</p>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {sorted.map((u,i)=>(
        <div key={u.username} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,background:i<3?"rgba(76,175,80,.1)":"rgba(27,94,32,.1)",border:`1px solid ${i<3?"rgba(76,175,80,.3)":"rgba(46,125,50,.2)"}`}}>
          <div style={{fontSize:i<3?20:14,minWidth:28,textAlign:"center",color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
            {medals[i]||`${i+1}`}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,color:"#c8e6c9",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{u.username}</div>
            <div style={{fontSize:11,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif"}}>{u.total} sighting{u.total!==1?"s":""}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{u.species.size}</div>
            <div style={{fontSize:9,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px"}}>SPECIES</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function FrogFinder() {
  const [tab,setTab]                 = useState("sound");
  const [communityTab,setCommunityTab] = useState("feed");
  const [user,setUser]               = useState(null);
  const [profile,setProfile]         = useState(null);
  const [showAuth,setShowAuth]       = useState(false);
  const [isRecording,setIsRecording] = useState(false);
  const [recSeconds,setRecSeconds]   = useState(0);
  const [audioData,setAudioData]     = useState(null);
  const [audioBlob,setAudioBlob]     = useState(null);
  const [matches,setMatches]         = useState(null);
  const [image,setImage]             = useState(null);
  const [imgB64,setImgB64]           = useState(null);
  const [imgFile,setImgFile]         = useState(null);
  const [photoResult,setPhotoResult] = useState(null);
  const [loading,setLoading]         = useState(false);
  const [refsLoading,setRefsLoading] = useState(true);
  const [refsCount,setRefsCount]     = useState(0);
  const [refsReady,setRefsReady]     = useState(false);
  const [error,setError]             = useState(null);
  const [journal,setJournal]         = useState([]);
  const [communitySightings,setCommunitySightings] = useState([]);
  const [playingRef,setPlayingRef]   = useState(null);
  const [location,setLocation]       = useState(null);
  const [savingLocation,setSavingLocation] = useState(false);

  const mediaRecRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const freqDataRef = useRef([]);
  const fileRef     = useRef(null);
  const refAudio    = useRef(null);

  // Auth listener
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user) { setUser(session.user); loadProfile(session.user.id); }
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){ setUser(session.user); loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); }
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const loadProfile = async (userId)=>{
    const {data}=await supabase.from("profiles").select("*").eq("id",userId).single();
    if(data) setProfile(data);
    else {
      // Auto-create profile
      const {data:userData}=await supabase.auth.getUser();
      const username=userData?.user?.user_metadata?.full_name||userData?.user?.email?.split("@")[0]||"frogfinder";
      await supabase.from("profiles").upsert({id:userId,username});
      setProfile({id:userId,username});
    }
  };

  // Load reference audio
  useEffect(()=>{
    let loaded=0;
    const load=async()=>{
      for(const frog of FROGS){
        const ok=await fingerprinter.loadReference(frog);
        if(ok){loaded++;setRefsCount(loaded);}
      }
      setRefsReady(true); setRefsLoading(false);
    };
    load();
  },[]);

  // Load journal from Supabase
  useEffect(()=>{
    if(user) loadJournal();
  },[user]);

  // Load community sightings
  useEffect(()=>{ loadCommunity(); },[]);

  const loadJournal = async ()=>{
    const {data}=await supabase.from("sightings").select("*").eq("user_id",user.id).order("created_at",{ascending:false});
    if(data) setJournal(data);
  };

  const loadCommunity = async ()=>{
    const {data}=await supabase.from("sightings").select("*").order("created_at",{ascending:false}).limit(50);
    if(data) setCommunitySightings(data);
  };

  // Get location
  const getLocation = ()=>{
    setSavingLocation(true);
    navigator.geolocation?.getCurrentPosition(
      pos=>{ setLocation({lat:pos.coords.latitude,lng:pos.coords.longitude}); setSavingLocation(false); },
      ()=>{ setSavingLocation(false); }
    );
  };

  // Recording
  const startRecording=async()=>{
    setError(null); setMatches(null); setAudioData(null); setAudioBlob(null);
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const actx=new (window.AudioContext||window.webkitAudioContext)();
      analyserRef.current=actx.createAnalyser(); analyserRef.current.fftSize=256;
      actx.createMediaStreamSource(stream).connect(analyserRef.current);
      chunksRef.current=[]; freqDataRef.current=[];
      const mime=MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/ogg';
      const mr=new MediaRecorder(stream,{mimeType:mime});
      mr.ondataavailable=e=>chunksRef.current.push(e.data);
      mr.onstop=()=>{
        setAudioBlob(new Blob(chunksRef.current,{type:mime}));
        setAudioData(freqDataRef.current.flat());
        stream.getTracks().forEach(t=>t.stop());
      };
      mr.start(100); mediaRecRef.current=mr;
      const snap=setInterval(()=>{
        if(!analyserRef.current) return;
        const b=new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(b); freqDataRef.current.push(Array.from(b));
      },100);
      setIsRecording(true); setRecSeconds(0);
      timerRef.current=setInterval(()=>setRecSeconds(s=>{
        if(s>=29){stopRecording();clearInterval(snap);return 30;} return s+1;
      }),1000);
      setTimeout(()=>{clearInterval(snap);if(mr.state!=="inactive"){mr.stop();setIsRecording(false);clearInterval(timerRef.current);}},30000);
    } catch { setError("Microphone access denied."); }
  };

  const stopRecording=()=>{
    if(mediaRecRef.current?.state!=="inactive") mediaRecRef.current.stop();
    setIsRecording(false); clearInterval(timerRef.current);
  };

  const identifySound=async()=>{
    if(!audioBlob) return;
    setLoading(true); setError(null);
    try {
      const scores=await fingerprinter.match(audioBlob);
      const good=scores.filter(s=>s.score>0.25);
      if(!good.length){ setError("No confident match. Try recording closer to the frog for at least 5 seconds."); }
      else {
        setMatches(good.slice(0,5));
        const best=good[0];
        await saveSighting({species:best.frog.name,confidence:toConf(best.score),confidencePct:toPct(best.score),method:"sound",frog:best.frog});
      }
    } catch(e){ setError("Identification failed. Try again."); }
    setLoading(false);
  };

  const playRef=(frog)=>{
    if(refAudio.current){refAudio.current.pause();refAudio.current=null;}
    if(playingRef===frog.file){setPlayingRef(null);return;}
    const a=new Audio(`/calls/${frog.file}.mp3`);
    a.onended=()=>setPlayingRef(null);
    a.play().catch(()=>setError("Could not play reference audio."));
    refAudio.current=a; setPlayingRef(frog.file);
  };

  const handlePhoto=(file)=>{
    if(!file?.type.startsWith("image/")) return;
    setImgFile(file);
    const r=new FileReader();
    r.onload=e=>{setImage(e.target.result);setImgB64(e.target.result.split(",")[1]);setPhotoResult(null);setError(null);};
    r.readAsDataURL(file);
  };

  const identifyPhoto=async()=>{
    if(!imgB64||!ANTHROPIC_API_KEY){setError("API key not configured.");return;}
    setLoading(true); setError(null);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:PHOTO_SYSTEM,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:"image/jpeg",data:imgB64}},
            {type:"text",text:"Identify this Florida frog. JSON only."}
          ]}]
        })
      });
      const d=await res.json();
      if(d.error) throw new Error(d.error.message);
      const txt=d.content?.find(b=>b.type==="text")?.text||"";
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setPhotoResult(parsed);
      if(parsed.identified&&parsed.species){
        const frog=FROGS.find(f=>f.name===parsed.species);
        await saveSighting({species:parsed.species,confidence:parsed.confidence,confidencePct:parsed.confidencePercent,method:"photo",frog,photoFile:imgFile});
      }
    } catch(e){setError(e.message||"Identification failed.");}
    setLoading(false);
  };

  const saveSighting=async({species,confidence,confidencePct,method,frog,photoFile})=>{
    if(!user) return; // not logged in, skip cloud save

    let photo_url=null;
    if(photoFile){
      const ext=photoFile.name.split(".").pop()||"jpg";
      const path=`${user.id}/${Date.now()}.${ext}`;
      const {data:uploadData,error:uploadError}=await supabase.storage.from("sighting-photos").upload(path,photoFile);
      if(!uploadError){
        const {data:{publicUrl}}=supabase.storage.from("sighting-photos").getPublicUrl(path);
        photo_url=publicUrl;
      }
    }

    const sighting={
      user_id:user.id,
      username:profile?.username||user.email?.split("@")[0],
      species,
      scientific:frog?.sci,
      confidence,
      confidence_pct:confidencePct,
      method,
      photo_url,
      latitude:location?.lat||null,
      longitude:location?.lng||null,
      native:frog?.native,
    };

    const {data,error}=await supabase.from("sightings").insert(sighting).select().single();
    if(!error&&data){
      setJournal(prev=>[data,...prev]);
      setCommunitySightings(prev=>[data,...prev]);
    }
  };

  const deleteSighting=async(id)=>{
    await supabase.from("sightings").delete().eq("id",id);
    setJournal(prev=>prev.filter(e=>e.id!==id));
    setCommunitySightings(prev=>prev.filter(e=>e.id!==id));
  };

  const correctSighting=async(id, newSpecies)=>{
    const frog=FROGS.find(f=>f.name===newSpecies);
    const updates={species:newSpecies, scientific:frog?.sci, native:frog?.native};
    await supabase.from("sightings").update(updates).eq("id",id);
    setJournal(prev=>prev.map(e=>e.id===id?{...e,...updates}:e));
    setCommunitySightings(prev=>prev.map(e=>e.id===id?{...e,...updates}:e));
  };

  const signOut=async()=>{ await supabase.auth.signOut(); setJournal([]); };

  const photoFrog=photoResult?.species?FROGS.find(f=>f.name===photoResult.species):null;
  const uniqueSpecies=[...new Set(journal.map(e=>e.species))].length;

  return (
    <div style={{minHeight:"100vh",background:"#060f08",fontFamily:"'Georgia',serif",color:"#e8f5e9",maxWidth:480,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .tab{flex:1;padding:10px 0;border:none;background:transparent;color:#4a7c59;font-size:9px;letter-spacing:1px;text-transform:uppercase;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;border-bottom:2px solid transparent;}
        .tab.on{color:#a5d6a7;border-bottom:2px solid #4caf50;}
        .ctab{padding:7px 14px;border-radius:20px;font-size:11px;font-family:'DM Sans',sans-serif;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .2s;border:1px solid #2e7d32;background:transparent;color:#4a7c59;}
        .ctab.on{background:rgba(76,175,80,.15);border-color:#4caf50;color:#a5d6a7;}
        input:focus{border-color:#4caf50 !important;}
        @keyframes pulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes playbar{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .fu{animation:up .35s ease forwards;}
        .pr{animation:pulse 1.5s ease-out infinite;}
      `}</style>

      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={u=>{setUser(u);loadProfile(u.id);setShowAuth(false);}}/>}

      {/* Header */}
      <div style={{padding:"22px 20px 0",background:"linear-gradient(180deg,#0a1f0c,#060f08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:12}}>
          <div style={{fontSize:30}}>🐸</div>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#c8e6c9",lineHeight:1,fontWeight:900}}>Florida Frog Finder</h1>
            <p style={{fontSize:9,color:"#4a7c59",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>
              {refsReady?`32 Species · Audio Ready ✓`:`Loading ${refsCount}/32…`}
            </p>
          </div>
          {/* Auth button */}
          {user?(
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{profile?.username||"..."}</div>
                <div style={{fontSize:9,color:"#2e7d32",fontFamily:"'DM Sans',sans-serif"}}>{uniqueSpecies} species</div>
              </div>
              <button onClick={signOut} style={{background:"rgba(27,94,32,.3)",border:"1px solid #2e7d32",borderRadius:8,color:"#4a7c59",cursor:"pointer",fontSize:10,padding:"5px 8px",fontFamily:"'DM Sans',sans-serif"}}>Sign out</button>
            </div>
          ):(
            <button onClick={()=>setShowAuth(true)} style={{padding:"8px 14px",borderRadius:12,background:"linear-gradient(135deg,#2e7d32,#43a047)",border:"none",color:"white",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
              Sign in
            </button>
          )}
        </div>
        {refsLoading&&<div style={{height:2,background:"#1b5e20",borderRadius:2,overflow:"hidden",marginBottom:1}}>
          <div style={{height:"100%",width:`${(refsCount/32)*100}%`,background:"linear-gradient(90deg,#2e7d32,#66bb6a)",transition:"width .3s ease"}}/>
        </div>}
        {/* Location bar */}
        {user&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0 10px"}}>
            <div style={{fontSize:11,color:location?"#66bb6a":"#4a7c59",fontFamily:"'DM Sans',sans-serif",flex:1}}>
              {location?`📍 ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`:"📍 Location not set — sightings won't appear on map"}
            </div>
            <button onClick={getLocation} disabled={savingLocation} style={{fontSize:10,padding:"4px 10px",borderRadius:8,background:"rgba(27,94,32,.3)",border:"1px solid #2e7d32",color:"#66bb6a",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
              {savingLocation?"...":location?"Update":"Get location"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #1a2e1c",background:"#060f08",position:"sticky",top:0,zIndex:10}}>
        {[["sound","🎙️ Sound"],["photo","📷 Photo"],["listen","🔊 Listen"],["journal","📓 Journal"],["community","🌎 Community"]].map(([id,label])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={{padding:"18px 18px 80px"}}>

        {/* SOUND TAB */}
        {tab==="sound"&&(
          <div className="fu">
            <p style={{fontSize:13,color:"#66bb6a",lineHeight:1.6,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
              Hold your phone near the frog and record. Compared against all 32 reference calls.
            </p>
            <Spectrogram analyserRef={analyserRef} isRecording={isRecording} audioData={audioData}/>
            {(isRecording||recSeconds>0)&&(
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,padding:"0 2px"}}>
                <span style={{fontSize:12,color:isRecording?"#ef5350":"#66bb6a",fontFamily:"monospace"}}>
                  {isRecording?`● REC ${formatTime(recSeconds)}`:`✓ ${formatTime(recSeconds)}s recorded`}
                </span>
                {isRecording&&<div style={{width:90,height:3,background:"#1b5e20",borderRadius:2,alignSelf:"center"}}>
                  <div style={{width:`${(recSeconds/30)*100}%`,height:"100%",background:"#ef5350",borderRadius:2,transition:"width .9s linear"}}/>
                </div>}
              </div>
            )}
            <div style={{display:"flex",justifyContent:"center",margin:"20px 0 16px"}}>
              <div style={{position:"relative"}}>
                {isRecording&&<div className="pr" style={{position:"absolute",inset:-16,borderRadius:"50%",border:"2px solid #ef5350",pointerEvents:"none"}}/>}
                <button onClick={isRecording?stopRecording:startRecording} disabled={refsLoading} style={{
                  width:76,height:76,borderRadius:"50%",
                  background:refsLoading?"#1a2e1c":isRecording?"radial-gradient(circle,#c62828,#b71c1c)":"radial-gradient(circle,#2e7d32,#1b5e20)",
                  border:`3px solid ${isRecording?"#ef9a9a":refsLoading?"#2e4030":"#4caf50"}`,
                  cursor:refsLoading?"not-allowed":"pointer",transition:"all .2s",
                  boxShadow:`0 0 30px ${isRecording?"rgba(239,83,80,.4)":"rgba(76,175,80,.3)"}`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2
                }}>
                  <span style={{fontSize:20}}>{refsLoading?"⏳":isRecording?"⏹":"🎙️"}</span>
                  <span style={{fontSize:8,color:"white",fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px"}}>
                    {refsLoading?"LOADING":isRecording?"STOP":"LISTEN"}
                  </span>
                </button>
              </div>
            </div>
            {audioBlob&&!isRecording&&(
              <button onClick={identifySound} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:14,background:"linear-gradient(135deg,#2e7d32,#43a047)",border:"none",color:"white",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 20px rgba(46,125,50,.5)",marginBottom:14,opacity:loading?0.7:1}}>
                {loading?"🔍 Matching against 32 species…":"🔍 Identify Call"}
              </button>
            )}
            {!user&&audioBlob&&!isRecording&&(
              <p style={{fontSize:11,color:"#4a7c59",textAlign:"center",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>
                <span onClick={()=>setShowAuth(true)} style={{color:"#66bb6a",cursor:"pointer",textDecoration:"underline"}}>Sign in</span> to save sightings to your journal
              </p>
            )}
            {loading&&<div style={{textAlign:"center",padding:"14px 0"}}>
              <div style={{width:32,height:32,border:"3px solid #1b5e20",borderTop:"3px solid #66bb6a",borderRadius:"50%",margin:"0 auto 8px",animation:"spin 1s linear infinite"}}/>
              <p style={{color:"#66bb6a",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>Analyzing frequency patterns…</p>
            </div>}
            {error&&<div style={{padding:"10px 12px",background:"rgba(183,28,28,.2)",border:"1px solid #c62828",borderRadius:10,marginBottom:10}}>
              <p style={{color:"#ef9a9a",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>⚠️ {error}</p>
            </div>}
            {matches&&(
              <div style={{marginTop:14}}>
                {(()=>{
                  const best=matches[0];
                  const conf=toConf(best.score);
                  const pct=toPct(best.score);
                  return (
                    <div style={{padding:16,borderRadius:20,background:`linear-gradient(135deg,rgba(27,94,32,.25),rgba(10,20,12,.4))`,border:`1px solid ${best.frog.color}55`,boxShadow:`0 8px 40px ${best.frog.color}18`,marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:9,color:"#66bb6a",letterSpacing:"2px",fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>BEST MATCH</div>
                          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:"#c8e6c9",lineHeight:1.2,marginBottom:2}}>{best.frog.name}</h2>
                          <div style={{fontSize:11,fontStyle:"italic",color:"#66bb6a",fontFamily:"'DM Sans',sans-serif"}}>{best.frog.sci}</div>
                          {!best.frog.native&&<div style={{fontSize:10,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>⚠️ Invasive species</div>}
                        </div>
                        <div style={{textAlign:"center",padding:"7px 11px",borderRadius:12,background:`${confColor(conf)}15`,border:`1px solid ${confColor(conf)}44`,minWidth:52}}>
                          <div style={{fontSize:17,fontWeight:800,color:confColor(conf),fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{pct}%</div>
                          <div style={{fontSize:8,color:confColor(conf),fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px",marginTop:1}}>{conf.toUpperCase()}</div>
                        </div>
                      </div>
                      <div style={{height:1,background:`${best.frog.color}30`,marginBottom:10}}/>
                      {[{icon:"🌿",label:"Habitat",val:best.frog.habitat},{icon:"📏",label:"Size",val:best.frog.size}].map(({icon,label,val})=>(
                        <div key={label} style={{marginBottom:7}}>
                          <div style={{fontSize:9,color:"#66bb6a",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{icon} {label}</div>
                          <div style={{fontSize:13,color:"#dcedc8",lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{val}</div>
                        </div>
                      ))}
                      <button onClick={()=>playRef(best.frog)} style={{width:"100%",padding:"9px",borderRadius:10,marginTop:8,background:playingRef===best.frog.file?"rgba(76,175,80,.2)":"rgba(27,94,32,.3)",border:`1px solid ${playingRef===best.frog.file?"#66bb6a":"#2e7d32"}`,color:playingRef===best.frog.file?"#a5d6a7":"#66bb6a",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"}}>
                        {playingRef===best.frog.file?"🔊 Playing…":"▶ Play Reference Call"}
                      </button>
                    </div>
                  );
                })()}
                {matches.length>1&&(
                  <div>
                    <div style={{fontSize:9,color:"#4a7c59",letterSpacing:"2px",fontFamily:"'DM Sans',sans-serif",marginBottom:7}}>OTHER CANDIDATES</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {matches.slice(1,4).map(({frog:f,score})=>(
                        <div key={f.file} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderRadius:12,background:"rgba(27,94,32,.12)",border:`1px solid ${f.color}33`}}>
                          <div>
                            <div style={{fontSize:13,color:"#a5d6a7",fontFamily:"'DM Sans',sans-serif"}}>{f.name}</div>
                            <div style={{fontSize:10,color:"#4a7c59",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>{f.sci}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <div style={{fontSize:12,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{toPct(score)}%</div>
                            <button onClick={()=>playRef(f)} style={{background:"rgba(27,94,32,.4)",border:"1px solid #2e7d32",borderRadius:8,color:"#66bb6a",cursor:"pointer",fontSize:11,padding:"3px 7px",fontFamily:"'DM Sans',sans-serif"}}>{playingRef===f.file?"⏹":"▶"}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PHOTO TAB */}
        {tab==="photo"&&(
          <div className="fu">
            <p style={{fontSize:13,color:"#66bb6a",lineHeight:1.6,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
              Take or upload a photo for AI identification using Claude Vision.
            </p>
            {!image?(
              <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed #2e7d32",borderRadius:18,padding:"44px 24px",textAlign:"center",cursor:"pointer",background:"rgba(27,94,32,.1)"}}>
                <div style={{fontSize:40,marginBottom:8}}>📷</div>
                <p style={{color:"#a5d6a7",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Upload or take a photo</p>
                <p style={{color:"#4a7c59",fontSize:11,fontFamily:"'DM Sans',sans-serif",marginTop:3}}>Tap to browse · Camera on mobile</p>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e=>handlePhoto(e.target.files[0])} style={{display:"none"}}/>
              </div>
            ):(
              <div style={{borderRadius:18,overflow:"hidden",position:"relative",boxShadow:"0 8px 40px rgba(0,0,0,.6)"}}>
                <img src={image} alt="frog" style={{width:"100%",maxHeight:280,objectFit:"cover",display:"block"}}/>
                <button onClick={()=>{setImage(null);setImgB64(null);setImgFile(null);setPhotoResult(null);}} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,.75)",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:17}}>×</button>
              </div>
            )}
            {image&&!loading&&<button onClick={identifyPhoto} style={{width:"100%",padding:"13px",borderRadius:14,marginTop:12,background:"linear-gradient(135deg,#2e7d32,#43a047)",border:"none",color:"white",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 20px rgba(46,125,50,.5)"}}>🔍 Identify Frog</button>}
            {!user&&image&&<p style={{fontSize:11,color:"#4a7c59",textAlign:"center",fontFamily:"'DM Sans',sans-serif",marginTop:8}}><span onClick={()=>setShowAuth(true)} style={{color:"#66bb6a",cursor:"pointer",textDecoration:"underline"}}>Sign in</span> to save photos to your journal</p>}
            {loading&&<div style={{textAlign:"center",padding:"18px 0"}}><div style={{width:32,height:32,border:"3px solid #1b5e20",borderTop:"3px solid #66bb6a",borderRadius:"50%",margin:"0 auto 8px",animation:"spin 1s linear infinite"}}/><p style={{color:"#66bb6a",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>Analyzing…</p></div>}
            {error&&<div style={{padding:"10px 12px",background:"rgba(183,28,28,.2)",border:"1px solid #c62828",borderRadius:10,marginTop:10}}><p style={{color:"#ef9a9a",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>⚠️ {error}</p></div>}
            {photoResult&&(
              <div style={{marginTop:14,padding:16,borderRadius:20,background:`linear-gradient(135deg,rgba(27,94,32,.25),rgba(10,20,12,.4))`,border:`1px solid ${photoFrog?.color||"#43a047"}55`}}>
                {!photoResult.identified?(
                  <div style={{textAlign:"center",padding:"10px 0"}}>
                    <div style={{fontSize:34,marginBottom:6}}>🤔</div>
                    <h3 style={{color:"#ffb300",fontFamily:"'Playfair Display',serif",marginBottom:5}}>Not identified as a Florida frog</h3>
                    <p style={{color:"#81c784",fontSize:13,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{photoResult.notes}</p>
                  </div>
                ):(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{flex:1}}>
                        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:"#c8e6c9",lineHeight:1.2,marginBottom:2}}>{photoResult.species}</h2>
                        <div style={{fontSize:11,fontStyle:"italic",color:"#66bb6a",fontFamily:"'DM Sans',sans-serif"}}>{photoFrog?.sci}</div>
                        {photoResult.native===false&&<div style={{fontSize:10,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>⚠️ Invasive</div>}
                      </div>
                      <div style={{textAlign:"center",padding:"7px 11px",borderRadius:12,background:`${confColor(photoResult.confidence)}15`,border:`1px solid ${confColor(photoResult.confidence)}44`,minWidth:52}}>
                        <div style={{fontSize:17,fontWeight:800,color:confColor(photoResult.confidence),fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{photoResult.confidencePercent}%</div>
                        <div style={{fontSize:8,color:confColor(photoResult.confidence),fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px",marginTop:1}}>{photoResult.confidence?.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{height:1,background:`${photoFrog?.color||"#43a047"}30`,marginBottom:10}}/>
                    {[{icon:"🌿",label:"Habitat",val:photoResult.habitat},{icon:"📏",label:"Size",val:photoResult.size},{icon:"🔎",label:"Features",val:photoResult.distinguishing},{icon:"🛡️",label:"Conservation",val:photoResult.conservationStatus}].filter(x=>x.val).map(({icon,label,val})=>(
                      <div key={label} style={{marginBottom:8}}>
                        <div style={{fontSize:9,color:"#66bb6a",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{icon} {label}</div>
                        <div style={{fontSize:13,color:"#dcedc8",lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{val}</div>
                      </div>
                    ))}
                    {photoResult.funFact&&<div style={{marginTop:10,padding:"9px 12px",background:"rgba(102,187,106,.1)",borderRadius:10,borderLeft:"3px solid #66bb6a"}}>
                      <div style={{fontSize:9,color:"#66bb6a",letterSpacing:"1.5px",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>🌟 FUN FACT</div>
                      <div style={{fontSize:12,color:"#c8e6c9",lineHeight:1.5,fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>{photoResult.funFact}</div>
                    </div>}
                    {photoFrog&&<button onClick={()=>playRef(photoFrog)} style={{width:"100%",padding:"9px",borderRadius:10,marginTop:10,background:playingRef===photoFrog.file?"rgba(76,175,80,.2)":"rgba(27,94,32,.3)",border:`1px solid ${playingRef===photoFrog.file?"#66bb6a":"#2e7d32"}`,color:playingRef===photoFrog.file?"#a5d6a7":"#66bb6a",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      {playingRef===photoFrog.file?"🔊 Playing…":"▶ Play Reference Call"}
                    </button>}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* LISTEN TAB */}
        {tab==="listen"&&(
          <div className="fu">
            <p style={{fontSize:13,color:"#66bb6a",lineHeight:1.6,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
              Browse all 32 Florida frog species and listen to their reference calls.
            </p>
            <ListenLibrary playingRef={playingRef} onPlay={playRef}/>
          </div>
        )}

        {/* JOURNAL TAB */}
        {tab==="journal"&&(
          <div className="fu">
            {!user?(
              <div style={{textAlign:"center",padding:"50px 20px"}}>
                <div style={{fontSize:48,marginBottom:14}}>📓</div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#c8e6c9",marginBottom:8}}>Your Field Journal</h3>
                <p style={{color:"#4a7c59",fontSize:13,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,marginBottom:20}}>Sign in to save your sightings, track your species checklist, and sync across devices.</p>
                <button onClick={()=>setShowAuth(true)} style={{padding:"12px 28px",borderRadius:14,background:"linear-gradient(135deg,#2e7d32,#43a047)",border:"none",color:"white",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Sign in / Create account</button>
              </div>
            ):(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:"#c8e6c9"}}>My Journal</h2>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:16,fontWeight:700,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif"}}>{uniqueSpecies}/{FROGS.length}</div>
                    <div style={{fontSize:9,color:"#2e7d32",fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px"}}>SPECIES</div>
                  </div>
                </div>
                {journal.length===0?(
                  <div style={{textAlign:"center",padding:"40px 0",color:"#2e7d32"}}>
                    <div style={{fontSize:40,marginBottom:10}}>🔍</div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13}}>No sightings yet.<br/>Identify a frog to log it!</p>
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
                    {journal.map(e=>{
                      const frog=FROGS.find(f=>f.name===e.species);
                      return (
                        <SightingCard key={e.id} sighting={e} frog={frog} isOwner={true}
                          onDelete={()=>deleteSighting(e.id)}
                          onCorrect={(newSpecies)=>correctSighting(e.id,newSpecies)}
                        />
                      );
                    })}
                  </div>
                )}
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#c8e6c9",marginBottom:10}}>
                  Species Checklist &nbsp;
                  <span style={{fontSize:11,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",fontStyle:"normal"}}>{uniqueSpecies}/{FROGS.length} found</span>
                </h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                  {FROGS.map(f=>{
                    const found=journal.some(e=>e.species===f.name);
                    return (
                      <div key={f.name} style={{padding:"7px 9px",borderRadius:9,background:found?`${f.color}22`:"rgba(18,30,20,.5)",border:`1px solid ${found?f.color+"55":"rgba(46,125,50,.2)"}`}}>
                        <div style={{fontSize:10,color:found?"#c8e6c9":"#4a7c59",fontFamily:"'DM Sans',sans-serif",lineHeight:1.3}}>{found?"✓ ":""}{f.name}</div>
                        {!f.native&&<div style={{fontSize:8,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif"}}>invasive</div>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* COMMUNITY TAB */}
        {tab==="community"&&(
          <div className="fu">
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[["feed","🌿 Feed"],["map","🗺️ Map"],["leaderboard","🏆 Leaders"]].map(([id,label])=>(
                <button key={id} className={`ctab${communityTab===id?" on":""}`} onClick={()=>setCommunityTab(id)}>{label}</button>
              ))}
            </div>
            {communityTab==="feed"&&<CommunityFeed sightings={communitySightings} currentUser={user} onDelete={deleteSighting} onCorrect={correctSighting}/>}
            {communityTab==="map"&&<FloridaMap sightings={communitySightings}/>}
            {communityTab==="leaderboard"&&(
              <>
                <div style={{marginBottom:16}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#c8e6c9",marginBottom:4}}>Top Frog Finders</h3>
                  <p style={{fontSize:12,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif"}}>Ranked by unique species identified</p>
                </div>
                <Leaderboard sightings={communitySightings}/>
              </>
            )}
            {!user&&(
              <div style={{marginTop:20,padding:"14px 16px",background:"rgba(27,94,32,.15)",border:"1px solid #2e7d32",borderRadius:14,textAlign:"center"}}>
                <p style={{fontSize:12,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>
                  <span onClick={()=>setShowAuth(true)} style={{textDecoration:"underline",cursor:"pointer"}}>Sign in</span> to add your sightings to the community feed and map
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
