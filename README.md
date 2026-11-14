# Paiman Wafa — Photography & Film Studio

A high-craft production portfolio for director, cinematographer, and photographer **Paiman Wafa**.

Features an interactive 3D camera hero that shatters into 1,400 glowing amber ember particles with realistic physics, custom Web Audio optical sound effects, dual-threat stills vs. motion comparison slider, production gear vault, and 35mm celluloid filmstrip carousel.

## Tech Stack

- **Framework**: TanStack Start / React 19 / Vite
- **3D Engine**: Three.js / React Three Fiber / Drei
- **Typography**: Instrument Serif, Syne, Instrument Sans, JetBrains Mono
- **Styling**: Tailwind CSS v4, Lucide Icons, Embla Carousel
- **Audio**: Web Audio API mechanical camera synthesis

## Development

```sh
npm install
npm run dev
```

Visit [http://localhost:8080/](http://localhost:8080/) to view the site locally.

## Deploying to Render

This repository includes a [`render.yaml`](file:///home/dewolf/OpenSource/particle-frame-studio/render.yaml) blueprint for one-click deployment:

1. Connect this GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** or use **Blueprints** pointing to `render.yaml`.
3. Render automatically sets:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build:render`
   - **Start Command**: `npm start`
   - **Environment Variable**: `RENDER=true` (builds the high-performance SSR Node server)
