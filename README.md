# Ramesh Ganamana — Personal Website

The complete professional portfolio for Ramesh Ganamana, Automation Engineer and AI Agent Developer. This is a standalone static website prepared for **Firebase Hosting**.

## What is included

- The existing design, responsive layout, uppercase RG branding, and supplied portrait.
- Professional background, four automation case studies, and three AI agents in development.
- Project filters, case-study dialogs, the workflow illustration switch, and mobile navigation.
- A user-triggered workflow demo (clearly labelled as a concept, not real execution), subtle pointer/scroll effects, active navigation, and a reading-progress indicator.
- Client-oriented capability cards and contact-topic buttons that prepare email/WhatsApp messages without sending anything.
- A persistent motion-pause control and automatic respect for the device's reduced-motion preference. Reading content remains visible without animation or JavaScript.
- The original downloadable résumé.
- Email and WhatsApp contact options with copy buttons. The number is designated for WhatsApp only.
- All CSS, JavaScript, SVG illustrations, image, and PDF assets in `dist/`.

The site uses plain HTML, CSS, and JavaScript. It does not need a backend, a database, API keys, a Firebase client SDK, or a ChatGPT account. Fonts are loaded from Google Fonts, with local fallback fonts.

## Preview locally

Use Node.js 22 or newer:

```sh
git clone https://github.com/Ramesh-Ganamana/personal-website.git
cd personal-website
npm run check
npm start
```

Open the URL printed in the terminal, normally `http://127.0.0.1:4187`. Keep that terminal open while previewing; press Ctrl+C to stop it. No npm dependency installation or build is needed for the site itself. To choose another port, use `npm start -- 4190`.

## Deploy to Firebase Hosting

Create or select a project in the [Firebase console](https://console.firebase.google.com/), then run these commands from this repository:

```sh
npm install -g firebase-tools
firebase login
firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

Replace `YOUR_FIREBASE_PROJECT_ID` with the actual project ID, not the display name. Firebase prints the deployed URL after success. The configured public directory is **`dist`** and there is **no build step**. Use Firebase Hosting for static files, not Firebase App Hosting.

`firebase.json` is already included, so you do not need to run `firebase init`. If you do initialize again, retain the `dist` directory and existing files rather than accepting an overwrite of `index.html` or the supplied configuration.

Firebase automatically runs the two predeploy commands: prepare the canonical/sharing URLs for the selected project and check the complete website. These commands do not change the design or page content. A failed check stops deployment.

Optionally save a project alias with `firebase use --add`; after that, `npm run deploy` uses the selected project. The local `.firebaserc` file is ignored so this repository does not assume a Firebase project ID.

### Custom domain or a different Firebase Hosting site

The default metadata URL is `https://YOUR_FIREBASE_PROJECT_ID.web.app`, derived from Firebase's deployment environment. When you use a custom domain or a Hosting site with a different ID, set its origin in `site.config.json`:

```json
{
  "url": "https://your-domain.example"
}
```

Run `npm run prepare:hosting` to update the sharing metadata locally. The `SITE_URL` environment variable can also override this setting. Leave `url` empty when using the default project Hosting site. Firebase Hosting serves the whole page and all assets independently of the previous host.

## Files to edit

| File | Purpose |
| --- | --- |
| `dist/index.html` | Profile, contact details, project cards, and page content |
| `dist/styles.css` | Design and responsive layout |
| `dist/app.js` | Case-study content and interactive behavior |
| `dist/experience.js` | Optional motion, workflow demo, reading position, and contact topics |
| `dist/ramesh-ganamana.jpg` | Supplied portrait |
| `dist/Ramesh-Ganamana-Resume.pdf` | Downloadable résumé |
| `dist/favicon.svg`, `dist/social.svg` | RG branding and sharing artwork |
| `firebase.json` | Static hosting directory, predeploy checks, and cache settings |
| `site.config.json` | Optional public domain for metadata |
| `serve.mjs` | Local preview server only; Firebase does not run it |

Navigation uses section anchors, so no server-side routes or SPA rewrites are required. Asset URLs are relative. The website has no dependency on the old private hosting origin, deployment credentials, or its access configuration.

After changing content, run `npm run check` and `npm test`, preview it, commit your changes, and run the Firebase deployment command again. Keep the metadata changes from deployment when committing updates. The dependency-free interaction tests cover demo completion/cancellation, reduced motion, unavailable storage, and contact-topic link preparation; responsive layout and keyboard focus also need real-browser checks.

## Content notes

Professional details and client-project contributions come from the supplied résumé. Agent projects are presented as in development with Codex. Accessibility and migration descriptions reflect their project documentation; the voice agent does not claim an unverified implementation stack or launch status. The project illustrations are conceptual graphics, not screenshots of client applications.

## Firebase references

- [Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart)
- [Hosting configuration](https://firebase.google.com/docs/hosting/full-config)
- [CLI, project selection, and predeploy hooks](https://firebase.google.com/docs/cli)
