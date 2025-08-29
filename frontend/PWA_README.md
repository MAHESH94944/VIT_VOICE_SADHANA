This folder contains the PWA setup added with `vite-plugin-pwa`.

What was added

- `vite.config.js`: configured `VitePWA` (autoUpdate, manifest)
- `public/icons/`: simple placeholder icons (icon-192.svg, icon-512.svg)
- `index.html`: manifest link and `theme-color` meta
- Production build generates `dist/manifest.webmanifest`, `dist/sw.js` and `dist/registerSW.js`

How to build and test locally

1. Install dev deps (if not already):

```
cd frontend
npm install
```

2. Build for production (generates `dist/`):

```
npm run build
```

3. Serve the `dist` folder (a static server is required to test service workers).

You can use a simple static server like `serve`:

```
npm install -g serve
serve -s dist -l 5000
```

Open `http://localhost:5000` in Chrome, open DevTools > Application and you should see the manifest and service worker registered.

Deploy

- Push to your Git hosting and redeploy to Vercel/Netlify. The `dist/` will include the manifest and service worker so PWABuilder will detect them.

Using PWABuilder to create Android APK/AAB

1. Deploy your site and copy the public URL (e.g. `https://vit-voice-sadhana.vercel.app`).
2. Go to https://www.pwabuilder.com and paste the URL.
3. PWABuilder will detect the manifest and service worker. Follow the steps to generate an Android package (APK or AAB).

Notes

- Replace placeholder icons in `public/icons/` with proper app icons (PNG or SVG) matching Android guidelines.
- For production, set the manifest icons to PNGs (512x512) for best compatibility.
- Ensure HTTPS for PWABuilder/Play store generation and service worker registration.
