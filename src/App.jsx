import { useState, useRef, useEffect } from "react";

// ── Species Data ──────────────────────────────────────────────────────────────
const FROGS = [
  { name:"American Bullfrog",          sci:"Lithobates catesbeianus",       color:"#4a7c59", file:"american-bullfrog",          habitat:"Permanent ponds, lakes, slow rivers",          size:'3.5–8"',   native:true  },
  { name:"Barking Treefrog",           sci:"Hyla gratiosa",                 color:"#558b2f", file:"barking-treefrog",            habitat:"Sandy scrub, pine flatwoods near water",       size:'2–2.75"',  native:true  },
  { name:"Bird-voiced Treefrog",       sci:"Hyla avivoca",                  color:"#7cb342", file:"bird-voiced-treefrog",        habitat:"Wooded swamps near rivers, panhandle",         size:'1.25–2"',  native:true  },
  { name:"Bronze Frog",                sci:"Lithobates clamitans",          color:"#a1887f", file:"bronze-frog",                 habitat:"Streams, springs, seepage areas",              size:'2–3.5"',   native:true  },
  { name:"Cane Toad",                  sci:"Rhinella marina",               color:"#795548", file:"cane-toad",                   habitat:"Urban areas, disturbed habitats (invasive)",   size:'4–9"',     native:false },
  { name:"Carpenter Frog",             sci:"Lithobates virgatipes",         color:"#a1887f", file:"carpenter-frog",              habitat:"Sphagnum bogs, blackwater streams",            size:'1.6–2.6"', native:true  },
  { name:"Coastal Plain Cricket Frog", sci:"Acris gryllus gryllus",         color:"#8bc34a", file:"coastal-plain-cricket-frog",  habitat:"Edges of ponds, streams, ditches",             size:'0.6–1.5"', native:true  },
  { name:"Cope's Gray Treefrog",       sci:"Hyla chrysoscelis",             color:"#78909c", file:"copes-gray-treefrog",         habitat:"Trees near permanent water, northern FL",      size:'1.5–2.5"', native:true  },
  { name:"Cuban Treefrog",             sci:"Osteopilus septentrionalis",    color:"#9e9d24", file:"cuban-treefrog",              habitat:"Buildings, trees, urban areas (invasive)",     size:'1.5–5.5"', native:false },
  { name:"Eastern Cricket Frog",       sci:"Acris crepitans",               color:"#8bc34a", file:"eastern-cricket-frog",        habitat:"Edges of ponds and streams, panhandle",        size:'0.6–1.5"', native:true  },
  { name:"Eastern Narrowmouth Toad",   sci:"Gastrophryne carolinensis",     color:"#616161", file:"eastern-narrowmouth-toad",    habitat:"Under debris, moist forests near water",       size:'0.75–1.5"',native:true  },
  { name:"Eastern Spadefoot",          sci:"Scaphiopus holbrookii",         color:"#5d4037", file:"eastern-spadefoot",           habitat:"Sandy uplands, emerges after heavy rain",      size:'1.75–3.25"',native:true },
  { name:"Florida Bog Frog",           sci:"Lithobates okaloosae",          color:"#2e7d32", file:"florida-bog-frog",            habitat:"Seepage bogs, NW Florida panhandle only",      size:'1.4–1.8"', native:true  },
  { name:"Florida Cricket Frog",       sci:"Acris gryllus dorsalis",        color:"#8bc34a", file:"florida-cricket-frog",        habitat:"Edges of ponds and streams statewide",         size:'0.6–1.5"', native:true  },
  { name:"Fowler's Toad",              sci:"Anaxyrus fowleri",              color:"#8d6e63", file:"fowlers-toad",                habitat:"Sandy areas, gardens, panhandle region",       size:'2–3.75"',  native:true  },
  { name:"Gopher Frog",                sci:"Lithobates capito",             color:"#8d6e63", file:"gopher-frog",                 habitat:"Longleaf pine, gopher tortoise burrows",       size:'2.6–3.75"',native:true  },
  { name:"Greenhouse Frog",            sci:"Eleutherodactylus planirostris",color:"#795548", file:"greenhouse-frog",             habitat:"Gardens, greenhouses, leaf litter (invasive)", size:'0.6–1.3"', native:false },
  { name:"Green Treefrog",             sci:"Hyla cinerea",                  color:"#6aab3a", file:"green-treefrog",              habitat:"Vegetation near ponds, ditches, swamps",       size:'1.25–2.5"',native:true  },
  { name:"Little Grass Frog",          sci:"Pseudacris ocularis",           color:"#9ccc65", file:"little-grass-frog",           habitat:"Grassy edges of shallow wetlands",             size:'0.4–0.6"', native:true  },
  { name:"Oak Toad",                   sci:"Anaxyrus quercicus",            color:"#78909c", file:"oak-toad",                    habitat:"Sandy pinelands, scrub, longleaf pine",        size:'0.75–1.3"',native:true  },
  { name:"Ornate Chorus Frog",         sci:"Pseudacris ornata",             color:"#66bb6a", file:"ornate-chorus-frog",          habitat:"Flatwoods, grassy ephemeral ponds, winter",    size:'0.9–1.5"', native:true  },
  { name:"Pig Frog",                   sci:"Lithobates grylio",             color:"#37474f", file:"pig-frog",                    habitat:"Lily pad marshes, cypress swamps, Everglades", size:'3.25–6.5"',native:true  },
  { name:"Pine Barrens Treefrog",      sci:"Hyla andersonii",              color:"#558b2f", file:"pine-barrens-treefrog",       habitat:"Seepage bogs, pitcher plant bogs, panhandle",  size:'1.25–2"',  native:true  },
  { name:"Pine Woods Treefrog",        sci:"Hyla femoralis",                color:"#795548", file:"pine-woods-treefrog",         habitat:"Pine flatwoods, sandy pinelands statewide",    size:'1–1.75"',  native:true  },
  { name:"River Frog",                 sci:"Lithobates heckscheri",         color:"#546e7a", file:"river-frog",                  habitat:"Swampy river margins, permanent water",        size:'3.25–5.25"',native:true },
  { name:"Southern Chorus Frog",       sci:"Pseudacris nigrita",            color:"#78909c", file:"southern-chorus-frog",        habitat:"Pine flatwoods, sandy soil, winter caller",    size:'0.75–1.25"',native:true },
  { name:"Southern Cricket Frog",      sci:"Acris gryllus",                 color:"#9ccc65", file:"southern-cricket-frog",       habitat:"Edges of any freshwater body, statewide",      size:'0.6–1.5"', native:true  },
  { name:"Southern Leopard Frog",      sci:"Lithobates sphenocephalus",     color:"#33691e", file:"southern-leopard-frog",       habitat:"Nearly any freshwater, very adaptable",        size:'2–3.5"',   native:true  },
  { name:"Southern Toad",              sci:"Anaxyrus terrestris",           color:"#8d6e63", file:"southern-toad",               habitat:"Sandy soil, suburban yards, statewide",        size:'1.5–3.5"', native:true  },
  { name:"Spring Peeper",              sci:"Pseudacris crucifer",           color:"#a5d6a7", file:"spring-peeper",               habitat:"Forests near wetlands, northern Florida",      size:'0.75–1.5"',native:true  },
  { name:"Squirrel Treefrog",          sci:"Hyla squirella",                color:"#8bc34a", file:"squirrel-treefrog",           habitat:"Gardens, trees, shrubs near water, statewide", size:'0.9–1.6"', native:true  },
  { name:"Upland Chorus Frog",         sci:"Pseudacris feriarum",           color:"#80cbc4", file:"upland-chorus-frog",          habitat:"Upland fields, woodland edges, panhandle",     size:'0.75–1.5"',native:true  },
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
  constructor() {
    this.referenceProfiles = new Map();
  }

  // Extract spectral profile from AudioBuffer
  extractProfile(audioBuffer) {
    const channel = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const segmentCount = 16;
    const segmentLen = Math.floor(channel.length / segmentCount);
    const profiles = [];

    for (let s = 0; s < segmentCount; s++) {
      const segment = channel.slice(s * segmentLen, (s + 1) * segmentLen);
      profiles.push(this.spectralBands(segment, sampleRate));
    }

    // Mean + variance across segments
    const bands = profiles[0].length;
    const mean = new Array(bands).fill(0);
    const variance = new Array(bands).fill(0);
    profiles.forEach(p => p.forEach((v, i) => mean[i] += v / segmentCount));
    profiles.forEach(p => p.forEach((v, i) => variance[i] += Math.pow(v - mean[i], 2) / segmentCount));

    // Peak frequency band index
    const peakBand = mean.indexOf(Math.max(...mean));
    // Energy ratio: high freq vs low freq
    const lowEnergy  = mean.slice(0, bands/2).reduce((a,b)=>a+b, 0);
    const highEnergy = mean.slice(bands/2).reduce((a,b)=>a+b, 0);
    const freqRatio  = highEnergy / (lowEnergy + 0.001);

    // Temporal variation (how rhythmic/repetitive)
    const temporalVar = variance.reduce((a,b)=>a+b,0) / bands;

    // RMS energy
    let rms = 0;
    for (let i = 0; i < channel.length; i++) rms += channel[i]*channel[i];
    rms = Math.sqrt(rms / channel.length);

    return { mean, variance, peakBand, freqRatio, temporalVar, rms, bands };
  }

  // Compute 32 frequency band energies using simple FFT-like approach
  spectralBands(samples, sampleRate) {
    const N = 512;
    const data = new Float32Array(N);
    for (let i = 0; i < N && i < samples.length; i++) data[i] = samples[i];

    const numBands = 32;
    const energies = new Array(numBands).fill(0);

    // Compute power spectrum using DFT (simplified)
    for (let k = 1; k <= N/2; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        re += data[n] * Math.cos(angle);
        im -= data[n] * Math.sin(angle);
      }
      const power = (re*re + im*im) / (N*N);
      const band = Math.min(numBands-1, Math.floor((k / (N/2)) * numBands));
      energies[band] += power;
    }

    // Normalize to 0-1
    const max = Math.max(...energies, 1e-10);
    return energies.map(e => e / max);
  }

  // Similarity score between two profiles (0-1)
  compare(a, b) {
    const bands = a.mean.length;

    // 1. Cosine similarity on mean spectrum
    let dot=0, magA=0, magB=0;
    for (let i=0; i<bands; i++) {
      dot  += a.mean[i] * b.mean[i];
      magA += a.mean[i] * a.mean[i];
      magB += b.mean[i] * b.mean[i];
    }
    const cosine = dot / (Math.sqrt(magA * magB) + 1e-10);

    // 2. Spectral shape similarity (correlation)
    let sumA=0, sumB=0;
    for (let i=0; i<bands; i++) { sumA+=a.mean[i]; sumB+=b.mean[i]; }
    const avgA=sumA/bands, avgB=sumB/bands;
    let num=0, denA=0, denB=0;
    for (let i=0; i<bands; i++) {
      num  += (a.mean[i]-avgA)*(b.mean[i]-avgB);
      denA += (a.mean[i]-avgA)**2;
      denB += (b.mean[i]-avgB)**2;
    }
    const pearson = num / (Math.sqrt(denA*denB)+1e-10);

    // 3. Peak band proximity
    const peakDist = Math.abs(a.peakBand - b.peakBand) / bands;
    const peakScore = 1 - peakDist;

    // 4. Freq ratio similarity
    const ratioSim = 1 - Math.min(1, Math.abs(a.freqRatio - b.freqRatio) / (Math.max(a.freqRatio, b.freqRatio)+0.001));

    // 5. Temporal pattern similarity
    const varSim = 1 - Math.min(1, Math.abs(a.temporalVar - b.temporalVar) / (Math.max(a.temporalVar, b.temporalVar)+0.001));

    return cosine*0.35 + pearson*0.25 + peakScore*0.2 + ratioSim*0.1 + varSim*0.1;
  }

  async loadReference(frog) {
    if (this.referenceProfiles.has(frog.file)) return true;
    try {
      const res = await fetch(`/calls/${frog.file}.mp3`);
      if (!res.ok) return false;
      const buf = await res.arrayBuffer();
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const audioBuf = await ctx.decodeAudioData(buf);
      await ctx.close();
      const profile = this.extractProfile(audioBuf);
      this.referenceProfiles.set(frog.file, profile);
      return true;
    } catch(e) {
      console.warn(`Could not load ${frog.name}:`, e);
      return false;
    }
  }

  async match(blob) {
    const buf = await blob.arrayBuffer();
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const audioBuf = await ctx.decodeAudioData(buf);
    await ctx.close();
    const recProfile = this.extractProfile(audioBuf);

    const scores = [];
    for (const frog of FROGS) {
      const ref = this.referenceProfiles.get(frog.file);
      if (ref) scores.push({ frog, score: this.compare(recProfile, ref) });
    }
    return scores.sort((a,b) => b.score - a.score);
  }
}

const fingerprinter = new AudioFingerprinter();

// ── Helpers ───────────────────────────────────────────────────────────────────
const confColor  = c  => c==="High"?"#4caf50":c==="Medium"?"#ffb300":"#ef5350";
const formatTime = s  => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
const toConf     = sc => sc>0.70?"High":sc>0.55?"Medium":"Low";
const toPct      = sc => Math.min(99, Math.round(sc*115));

// ── Spectrogram ───────────────────────────────────────────────────────────────
function Spectrogram({ analyserRef, isRecording, audioData }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const colRef    = useRef(0);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); ctx.fillStyle="#020f06"; ctx.fillRect(0,0,c.width,c.height);
  }, []);

  useEffect(() => {
    if (!isRecording||!analyserRef.current) return;
    const c=canvasRef.current, ctx=c.getContext("2d"), W=c.width, H=c.height;
    const buf=new Uint8Array(analyserRef.current.frequencyBinCount);
    const draw=()=>{
      animRef.current=requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(buf);
      const sh=H/buf.length;
      for(let i=0;i<buf.length;i++){
        const v=buf[i]/255, y=H-i*sh;
        ctx.fillStyle=`rgb(${Math.floor(v<0.5?0:(v-0.5)*400)},${Math.floor(v<0.5?v*360:180-(v-0.5)*120)},${Math.floor(v<0.5?v*160:0)})`;
        ctx.fillRect(colRef.current,y,2,sh+1);
      }
      colRef.current=(colRef.current+2)%W;
      ctx.fillStyle="rgba(200,255,200,0.1)"; ctx.fillRect(colRef.current,0,1,H);
    };
    draw(); return ()=>cancelAnimationFrame(animRef.current);
  }, [isRecording]);

  useEffect(()=>{
    if(isRecording||!audioData?.length) return;
    const c=canvasRef.current, ctx=c.getContext("2d"), W=c.width, H=c.height;
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

// ── Main App ──────────────────────────────────────────────────────────────────
export default function FrogFinder() {
  const [tab,setTab]               = useState("sound");
  const [isRecording,setIsRecording] = useState(false);
  const [recSeconds,setRecSeconds] = useState(0);
  const [audioData,setAudioData]   = useState(null);
  const [audioBlob,setAudioBlob]   = useState(null);
  const [matches,setMatches]       = useState(null);
  const [image,setImage]           = useState(null);
  const [imgB64,setImgB64]         = useState(null);
  const [photoResult,setPhotoResult] = useState(null);
  const [loading,setLoading]       = useState(false);
  const [refsLoading,setRefsLoading] = useState(true);
  const [refsReady,setRefsReady]   = useState(false);
  const [refsCount,setRefsCount]   = useState(0);
  const [error,setError]           = useState(null);
  const [journal,setJournal]       = useState([]);
  const [playingRef,setPlayingRef] = useState(null);

  const mediaRecRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const freqDataRef = useRef([]);
  const fileRef     = useRef(null);
  const refAudio    = useRef(null);

  // Load all reference profiles on mount
  useEffect(()=>{
    let loaded=0;
    const load = async ()=>{
      for (const frog of FROGS) {
        const ok = await fingerprinter.loadReference(frog);
        if (ok) { loaded++; setRefsCount(loaded); }
      }
      setRefsReady(true); setRefsLoading(false);
    };
    load();
  },[]);

  // Recording
  const startRecording = async ()=>{
    setError(null); setMatches(null); setAudioData(null); setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      const actx = new (window.AudioContext||window.webkitAudioContext)();
      analyserRef.current = actx.createAnalyser(); analyserRef.current.fftSize=256;
      actx.createMediaStreamSource(stream).connect(analyserRef.current);
      chunksRef.current=[]; freqDataRef.current=[];
      const mime = MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/ogg';
      const mr = new MediaRecorder(stream,{mimeType:mime});
      mr.ondataavailable = e=>chunksRef.current.push(e.data);
      mr.onstop = ()=>{
        setAudioBlob(new Blob(chunksRef.current,{type:mime}));
        setAudioData(freqDataRef.current.flat());
        stream.getTracks().forEach(t=>t.stop());
      };
      mr.start(100); mediaRecRef.current=mr;
      const snap=setInterval(()=>{
        if(!analyserRef.current) return;
        const b=new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(b);
        freqDataRef.current.push(Array.from(b));
      },100);
      setIsRecording(true); setRecSeconds(0);
      timerRef.current=setInterval(()=>setRecSeconds(s=>{
        if(s>=29){stopRecording();clearInterval(snap);return 30;}
        return s+1;
      }),1000);
      setTimeout(()=>{clearInterval(snap);if(mr.state!=="inactive"){mr.stop();setIsRecording(false);clearInterval(timerRef.current);}},30000);
    } catch { setError("Microphone access denied. Please allow microphone permissions."); }
  };

  const stopRecording = ()=>{
    if(mediaRecRef.current?.state!=="inactive") mediaRecRef.current.stop();
    setIsRecording(false); clearInterval(timerRef.current);
  };

  const identifySound = async ()=>{
    if(!audioBlob) return;
    setLoading(true); setError(null);
    try {
      const scores = await fingerprinter.match(audioBlob);
      const good = scores.filter(s=>s.score>0.25);
      if(!good.length){ setError("No confident match found. Try recording closer to the frog for at least 5 seconds."); }
      else {
        setMatches(good.slice(0,5));
        const best=good[0];
        addJournal({species:best.frog.name,confidence:toConf(best.score),confidencePercent:toPct(best.score)},"sound",best.frog);
      }
    } catch(e){ setError("Identification failed. Please try again."); }
    setLoading(false);
  };

  const playRef = (frog)=>{
    if(refAudio.current){refAudio.current.pause();refAudio.current=null;}
    if(playingRef===frog.file){setPlayingRef(null);return;}
    const a=new Audio(`/calls/${frog.file}.mp3`);
    a.onended=()=>setPlayingRef(null);
    a.play().catch(()=>setError("Could not play reference audio."));
    refAudio.current=a; setPlayingRef(frog.file);
  };

  const handlePhoto = file=>{
    if(!file?.type.startsWith("image/")) return;
    const r=new FileReader();
    r.onload=e=>{setImage(e.target.result);setImgB64(e.target.result.split(",")[1]);setPhotoResult(null);setError(null);};
    r.readAsDataURL(file);
  };

  const identifyPhoto = async ()=>{
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
        addJournal(parsed,"photo",frog);
      }
    } catch(e){setError(e.message||"Identification failed.");}
    setLoading(false);
  };

  const addJournal=(result,type,frog)=>{
    setJournal(prev=>[{
      id:Date.now(),type,species:result.species,scientific:frog?.sci,
      confidence:result.confidence,confidencePercent:result.confidencePercent,
      color:frog?.color||"#4a7c59",native:frog?.native,timestamp:new Date().toLocaleString()
    },...prev]);
  };

  const photoFrog = photoResult?.species?FROGS.find(f=>f.name===photoResult.species):null;

  return (
    <div style={{minHeight:"100vh",background:"#060f08",fontFamily:"'Georgia',serif",color:"#e8f5e9",maxWidth:480,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .tab{flex:1;padding:12px 0;border:none;background:transparent;color:#4a7c59;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;border-bottom:2px solid transparent;}
        .tab.on{color:#a5d6a7;border-bottom:2px solid #4caf50;}
        @keyframes pulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bar{0%,100%{opacity:.4}50%{opacity:1}}
        .fu{animation:up .4s ease forwards;}
        .pr{animation:pulse 1.5s ease-out infinite;}
      `}</style>

      {/* Header */}
      <div style={{padding:"28px 24px 0",background:"linear-gradient(180deg,#0a1f0c,#060f08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,paddingBottom:14}}>
          <div style={{fontSize:34}}>🐸</div>
          <div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#c8e6c9",lineHeight:1,fontWeight:900}}>Florida Frog Finder</h1>
            <p style={{fontSize:10,color:"#4a7c59",letterSpacing:"2.5px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>
              {refsReady?`32 Species · Audio Engine Ready ✓`:`Loading ${refsCount}/32 Reference Calls…`}
            </p>
          </div>
          <div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:700,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif"}}>{journal.length}</div>
            <div style={{fontSize:9,color:"#2e7d32",letterSpacing:"1px",fontFamily:"'DM Sans',sans-serif"}}>LOGGED</div>
          </div>
        </div>
        {refsLoading&&(
          <div style={{height:2,background:"#1b5e20",borderRadius:2,overflow:"hidden",marginBottom:1}}>
            <div style={{height:"100%",width:`${(refsCount/32)*100}%`,background:"linear-gradient(90deg,#2e7d32,#66bb6a)",transition:"width .3s ease"}}/>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #1a2e1c",background:"#060f08",position:"sticky",top:0,zIndex:10}}>
        {[["sound","🎙️ Sound"],["photo","📷 Photo"],["journal","📓 Journal"]].map(([id,label])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={{padding:"20px 20px 80px"}}>

        {/* SOUND */}
        {tab==="sound"&&(
          <div className="fu">
            <p style={{fontSize:13,color:"#66bb6a",lineHeight:1.6,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
              Hold your phone near the frog and record at least 5 seconds. The app compares your recording against all 32 real reference calls.
            </p>

            <Spectrogram analyserRef={analyserRef} isRecording={isRecording} audioData={audioData}/>

            {(isRecording||recSeconds>0)&&(
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8,padding:"0 4px"}}>
                <span style={{fontSize:12,color:isRecording?"#ef5350":"#66bb6a",fontFamily:"monospace"}}>
                  {isRecording?`● REC ${formatTime(recSeconds)}`:`✓ ${formatTime(recSeconds)}s recorded`}
                </span>
                {isRecording&&<div style={{width:100,height:4,background:"#1b5e20",borderRadius:2}}>
                  <div style={{width:`${(recSeconds/30)*100}%`,height:"100%",background:"#ef5350",borderRadius:2,transition:"width .9s linear"}}/>
                </div>}
              </div>
            )}

            <div style={{display:"flex",justifyContent:"center",margin:"24px 0 20px"}}>
              <div style={{position:"relative"}}>
                {isRecording&&<div className="pr" style={{position:"absolute",inset:-16,borderRadius:"50%",border:"2px solid #ef5350",pointerEvents:"none"}}/>}
                <button onClick={isRecording?stopRecording:startRecording} disabled={refsLoading} style={{
                  width:80,height:80,borderRadius:"50%",
                  background:refsLoading?"#1a2e1c":isRecording?"radial-gradient(circle,#c62828,#b71c1c)":"radial-gradient(circle,#2e7d32,#1b5e20)",
                  border:`3px solid ${isRecording?"#ef9a9a":refsLoading?"#2e4030":"#4caf50"}`,
                  cursor:refsLoading?"not-allowed":"pointer",transition:"all .2s",
                  boxShadow:`0 0 30px ${isRecording?"rgba(239,83,80,.4)":"rgba(76,175,80,.3)"}`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2
                }}>
                  <span style={{fontSize:22}}>{refsLoading?"⏳":isRecording?"⏹":"🎙️"}</span>
                  <span style={{fontSize:9,color:"white",fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px"}}>
                    {refsLoading?"LOADING":isRecording?"STOP":"LISTEN"}
                  </span>
                </button>
              </div>
            </div>

            {audioBlob&&!isRecording&&(
              <button onClick={identifySound} disabled={loading} style={{
                width:"100%",padding:"14px",borderRadius:14,
                background:"linear-gradient(135deg,#2e7d32,#43a047)",
                border:"none",color:"white",fontSize:15,fontWeight:600,
                cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                boxShadow:"0 4px 20px rgba(46,125,50,.5)",marginBottom:16,opacity:loading?0.7:1
              }}>{loading?"🔍 Matching against 32 species…":"🔍 Identify Call"}</button>
            )}

            {loading&&<div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{width:36,height:36,border:"3px solid #1b5e20",borderTop:"3px solid #66bb6a",borderRadius:"50%",margin:"0 auto 10px",animation:"spin 1s linear infinite"}}/>
              <p style={{color:"#66bb6a",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Analyzing frequency patterns against 32 reference calls…</p>
            </div>}

            {error&&<div style={{padding:"12px 14px",background:"rgba(183,28,28,.2)",border:"1px solid #c62828",borderRadius:10,marginBottom:12}}>
              <p style={{color:"#ef9a9a",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>⚠️ {error}</p>
            </div>}

            {/* Sound Results */}
            {matches&&(
              <div style={{marginTop:16}}>
                {/* Best match */}
                {(()=>{
                  const best=matches[0];
                  const conf=toConf(best.score);
                  const pct=toPct(best.score);
                  return (
                    <div style={{padding:18,borderRadius:20,background:`linear-gradient(135deg,rgba(27,94,32,.25),rgba(10,20,12,.4))`,border:`1px solid ${best.frog.color}55`,boxShadow:`0 8px 40px ${best.frog.color}18`,marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:10,color:"#66bb6a",letterSpacing:"2px",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>BEST MATCH</div>
                          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#c8e6c9",lineHeight:1.2,marginBottom:2}}>{best.frog.name}</h2>
                          <div style={{fontSize:11,fontStyle:"italic",color:"#66bb6a",fontFamily:"'DM Sans',sans-serif"}}>{best.frog.sci}</div>
                          {!best.frog.native&&<div style={{fontSize:10,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>⚠️ Invasive species</div>}
                        </div>
                        <div style={{textAlign:"center",padding:"8px 12px",borderRadius:12,background:`${confColor(conf)}15`,border:`1px solid ${confColor(conf)}44`,minWidth:56}}>
                          <div style={{fontSize:18,fontWeight:800,color:confColor(conf),fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{pct}%</div>
                          <div style={{fontSize:9,color:confColor(conf),fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px",marginTop:2}}>{conf.toUpperCase()}</div>
                        </div>
                      </div>
                      <div style={{height:1,background:`${best.frog.color}30`,marginBottom:10}}/>
                      {[{icon:"🌿",label:"Habitat",val:best.frog.habitat},{icon:"📏",label:"Size",val:best.frog.size}].map(({icon,label,val})=>(
                        <div key={label} style={{marginBottom:8}}>
                          <div style={{fontSize:10,color:"#66bb6a",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{icon} {label}</div>
                          <div style={{fontSize:13,color:"#dcedc8",lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{val}</div>
                        </div>
                      ))}
                      <button onClick={()=>playRef(best.frog)} style={{
                        width:"100%",padding:"10px",borderRadius:12,marginTop:8,
                        background:playingRef===best.frog.file?"rgba(76,175,80,.2)":"rgba(27,94,32,.3)",
                        border:`1px solid ${playingRef===best.frog.file?"#66bb6a":"#2e7d32"}`,
                        color:playingRef===best.frog.file?"#a5d6a7":"#66bb6a",
                        cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"
                      }}>{playingRef===best.frog.file?"🔊 Playing reference call…":"▶ Play Reference Call"}</button>
                    </div>
                  );
                })()}

                {/* Other candidates */}
                {matches.length>1&&(
                  <div>
                    <div style={{fontSize:10,color:"#4a7c59",letterSpacing:"2px",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>OTHER CANDIDATES</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {matches.slice(1,4).map(({frog:f,score})=>(
                        <div key={f.file} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:12,background:"rgba(27,94,32,.12)",border:`1px solid ${f.color}33`}}>
                          <div>
                            <div style={{fontSize:13,color:"#a5d6a7",fontFamily:"'DM Sans',sans-serif"}}>{f.name}</div>
                            <div style={{fontSize:10,color:"#4a7c59",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>{f.sci}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{fontSize:12,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{toPct(score)}%</div>
                            <button onClick={()=>playRef(f)} style={{background:"rgba(27,94,32,.4)",border:"1px solid #2e7d32",borderRadius:8,color:"#66bb6a",cursor:"pointer",fontSize:11,padding:"4px 8px",fontFamily:"'DM Sans',sans-serif"}}>
                              {playingRef===f.file?"⏹":"▶"}
                            </button>
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

        {/* PHOTO */}
        {tab==="photo"&&(
          <div className="fu">
            <p style={{fontSize:13,color:"#66bb6a",lineHeight:1.6,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
              Take or upload a photo for AI identification using Claude Vision.
            </p>
            {!image?(
              <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed #2e7d32",borderRadius:18,padding:"48px 24px",textAlign:"center",cursor:"pointer",background:"rgba(27,94,32,.1)"}}>
                <div style={{fontSize:44,marginBottom:10}}>📷</div>
                <p style={{color:"#a5d6a7",fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Upload or take a photo</p>
                <p style={{color:"#4a7c59",fontSize:12,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Tap to browse · Camera on mobile</p>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e=>handlePhoto(e.target.files[0])} style={{display:"none"}}/>
              </div>
            ):(
              <div style={{borderRadius:18,overflow:"hidden",position:"relative",boxShadow:"0 8px 40px rgba(0,0,0,.6)"}}>
                <img src={image} alt="frog" style={{width:"100%",maxHeight:300,objectFit:"cover",display:"block"}}/>
                <button onClick={()=>{setImage(null);setImgB64(null);setPhotoResult(null);}} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,.75)",border:"none",borderRadius:"50%",width:34,height:34,color:"white",cursor:"pointer",fontSize:18}}>×</button>
              </div>
            )}
            {image&&!loading&&<button onClick={identifyPhoto} style={{width:"100%",padding:"14px",borderRadius:14,marginTop:14,background:"linear-gradient(135deg,#2e7d32,#43a047)",border:"none",color:"white",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 20px rgba(46,125,50,.5)"}}>🔍 Identify Frog</button>}
            {loading&&<div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:36,height:36,border:"3px solid #1b5e20",borderTop:"3px solid #66bb6a",borderRadius:"50%",margin:"0 auto 10px",animation:"spin 1s linear infinite"}}/>
              <p style={{color:"#66bb6a",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Analyzing photo…</p>
            </div>}
            {error&&<div style={{padding:"12px 14px",background:"rgba(183,28,28,.2)",border:"1px solid #c62828",borderRadius:10,marginTop:12}}>
              <p style={{color:"#ef9a9a",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>⚠️ {error}</p>
            </div>}
            {photoResult&&(
              <div style={{marginTop:16,padding:18,borderRadius:20,background:`linear-gradient(135deg,rgba(27,94,32,.25),rgba(10,20,12,.4))`,border:`1px solid ${photoFrog?.color||"#43a047"}55`}}>
                {!photoResult.identified?(
                  <div style={{textAlign:"center",padding:"12px 0"}}>
                    <div style={{fontSize:36,marginBottom:8}}>🤔</div>
                    <h3 style={{color:"#ffb300",fontFamily:"'Playfair Display',serif",marginBottom:6}}>Not identified as a Florida frog</h3>
                    <p style={{color:"#81c784",fontSize:13,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{photoResult.notes}</p>
                  </div>
                ):(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div style={{flex:1}}>
                        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#c8e6c9",lineHeight:1.2,marginBottom:2}}>{photoResult.species}</h2>
                        <div style={{fontSize:11,fontStyle:"italic",color:"#66bb6a",fontFamily:"'DM Sans',sans-serif"}}>{photoFrog?.sci}</div>
                        {photoResult.native===false&&<div style={{fontSize:10,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>⚠️ Invasive species</div>}
                      </div>
                      <div style={{textAlign:"center",padding:"8px 12px",borderRadius:12,background:`${confColor(photoResult.confidence)}15`,border:`1px solid ${confColor(photoResult.confidence)}44`,minWidth:56}}>
                        <div style={{fontSize:18,fontWeight:800,color:confColor(photoResult.confidence),fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{photoResult.confidencePercent}%</div>
                        <div style={{fontSize:9,color:confColor(photoResult.confidence),fontFamily:"'DM Sans',sans-serif",letterSpacing:"1px",marginTop:2}}>{photoResult.confidence?.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{height:1,background:`${photoFrog?.color||"#43a047"}30`,marginBottom:12}}/>
                    {[{icon:"🌿",label:"Habitat",val:photoResult.habitat},{icon:"📏",label:"Size",val:photoResult.size},{icon:"🔎",label:"Features",val:photoResult.distinguishing},{icon:"🛡️",label:"Conservation",val:photoResult.conservationStatus}].filter(x=>x.val).map(({icon,label,val})=>(
                      <div key={label} style={{marginBottom:10}}>
                        <div style={{fontSize:10,color:"#66bb6a",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{icon} {label}</div>
                        <div style={{fontSize:13,color:"#dcedc8",lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{val}</div>
                      </div>
                    ))}
                    {photoResult.funFact&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(102,187,106,.1)",borderRadius:10,borderLeft:"3px solid #66bb6a"}}>
                      <div style={{fontSize:9,color:"#66bb6a",letterSpacing:"1.5px",fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>🌟 FUN FACT</div>
                      <div style={{fontSize:13,color:"#c8e6c9",lineHeight:1.5,fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>{photoResult.funFact}</div>
                    </div>}
                    {photoFrog&&<button onClick={()=>playRef(photoFrog)} style={{width:"100%",padding:"10px",borderRadius:12,marginTop:12,background:playingRef===photoFrog.file?"rgba(76,175,80,.2)":"rgba(27,94,32,.3)",border:`1px solid ${playingRef===photoFrog.file?"#66bb6a":"#2e7d32"}`,color:playingRef===photoFrog.file?"#a5d6a7":"#66bb6a",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"}}>
                      {playingRef===photoFrog.file?"🔊 Playing reference call…":"▶ Play Reference Call"}
                    </button>}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* JOURNAL */}
        {tab==="journal"&&(
          <div className="fu">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#c8e6c9"}}>Field Journal</h2>
              {journal.length>0&&<button onClick={()=>setJournal([])} style={{fontSize:11,color:"#4a7c59",background:"none",border:"1px solid #1b5e20",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Clear all</button>}
            </div>
            {journal.length===0?(
              <div style={{textAlign:"center",padding:"60px 0",color:"#2e7d32"}}>
                <div style={{fontSize:48,marginBottom:12}}>📓</div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14}}>No sightings yet.<br/>Identify a frog to log it!</p>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                {journal.map(e=>(
                  <div key={e.id} style={{padding:"14px 16px",borderRadius:14,background:"rgba(27,94,32,.15)",border:`1px solid ${e.color}44`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:600,color:"#c8e6c9",fontFamily:"'DM Sans',sans-serif"}}>{e.species}</div>
                        <div style={{fontSize:11,color:"#66bb6a",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>{e.scientific}</div>
                        {e.native===false&&<div style={{fontSize:10,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif"}}>⚠️ Invasive</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${confColor(e.confidence)}22`,color:confColor(e.confidence),fontFamily:"'DM Sans',sans-serif"}}>{e.confidencePercent}%</span>
                        <span style={{fontSize:12}}>{e.type==="sound"?"🎙️":"📷"}</span>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:"#4a7c59",fontFamily:"'DM Sans',sans-serif"}}>🕐 {e.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#c8e6c9",marginBottom:12}}>
              Species Checklist &nbsp;
              <span style={{fontSize:12,color:"#66bb6a",fontFamily:"'DM Sans',sans-serif",fontStyle:"normal"}}>
                {[...new Set(journal.map(e=>e.species))].length}/{FROGS.length} found
              </span>
            </h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {FROGS.map(f=>{
                const found=journal.some(e=>e.species===f.name);
                return (
                  <div key={f.name} style={{padding:"8px 10px",borderRadius:10,background:found?`${f.color}22`:"rgba(18,30,20,.5)",border:`1px solid ${found?f.color+"55":"rgba(46,125,50,.2)"}`}}>
                    <div style={{fontSize:11,color:found?"#c8e6c9":"#4a7c59",fontFamily:"'DM Sans',sans-serif",lineHeight:1.3}}>{found?"✓ ":""}{f.name}</div>
                    {!f.native&&<div style={{fontSize:9,color:"#ff8a65",fontFamily:"'DM Sans',sans-serif"}}>invasive</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}