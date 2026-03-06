# 🐸 Florida Frog Finder

Identify all 19 Florida frog species by **sound** or **photo** using Claude AI — like Merlin, but for frogs.

## Features
- 🎙️ **Live audio recording** with real-time spectrogram visualization
- 📷 **Photo identification** via camera or upload
- 📓 **Field journal** — auto-logs every identification with timestamp
- ✅ **Species checklist** — track all 19 species you've found
- 🔊 **Example call playback** for each identified species

## Deploy to Vercel

### 1. Add your Anthropic API key
In Vercel → Project Settings → Environment Variables, add:
```
VITE_ANTHROPIC_API_KEY = your_key_here
```
Get a key at: https://console.anthropic.com

### 2. Deploy
```bash
npm install
npm run build   # test locally first
```
Then push to GitHub and import the repo on vercel.com — it auto-detects Vite.

## Local Development
```bash
npm install
echo "VITE_ANTHROPIC_API_KEY=your_key_here" > .env.local
npm run dev
```

## The 19 Florida Species
American Bullfrog, Green Treefrog, Squirrel Treefrog, Barking Treefrog, Pine Woods Treefrog, Cuban Treefrog, Southern Leopard Frog, Pig Frog, River Frog, Florida Bog Frog, Carpenter Frog, Gopher Frog, Eastern Narrow-mouthed Toad, Oak Toad, Southern Toad, Eastern Spadefoot Toad, Little Grass Frog, Southern Chorus Frog, Ornate Chorus Frog.

## Tech Stack
- React 18 + Vite
- Web Audio API (live spectrogram)
- Claude claude-sonnet-4-20250514 (vision + audio analysis)
- Zero dependencies beyond React
