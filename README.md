# Dental SaaS Platform — Developer Setup

A dental imaging viewer built on [OHIF Viewer v3](https://ohif.org) with a custom dental extension, synthetic demo images, and a local REST API for measurement persistence.

---

## Project Structure

```
dental/
├── Viewers/          # OHIF Viewer (frontend) — dental extension + mode
└── backend/          # Express REST API — measurement persistence
```

---

## Prerequisites

| Tool | Required version |
|------|-----------------|
| Node.js | >= 24 |
| pnpm | >= 11 |

Install pnpm if you don't have it:

```bash
npm install -g pnpm@11
```

---

## 1. Backend (Measurement API)

The backend runs on **http://localhost:3001** and persists measurements to a local JSON file (`backend/data/measurements.json`).

### Install dependencies

```bash
cd dental/backend
npm install
```

### Start (production)

```bash
npm start
```

### Start (development — auto-restarts on file change)

```bash
npm run dev
```

### Available endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/measurements?studyInstanceUID=xxx` | Fetch saved measurements for a study |
| `POST` | `/api/measurements` | Save or update a measurement |
| `PUT` | `/api/measurements/:uid` | Update a specific measurement |
| `DELETE` | `/api/measurements/:uid` | Delete a specific measurement |
| `DELETE` | `/api/measurements?studyInstanceUID=xxx` | Clear all measurements for a study |

---

## 2. OHIF Viewer (Frontend)

The viewer runs on **http://localhost:3000** and uses built-in synthetic dental images — no external DICOM server required.

### Install dependencies

```bash
cd dental/Viewers
pnpm install or pnpm install --frozen-lockfile
```

### Start development server

```bash
pnpm dev
```

The viewer will be available at **http://localhost:3000**.

### Open the dental worklist directly

```
http://localhost:3000/dental
```

---

## 3. Running Both Together

Open two terminal windows:

**Terminal 1 — Backend:**

```bash
cd dental/backend
npm run dev
```

**Terminal 2 — Viewer:**

```bash
cd dental/Viewers
pnpm dev
```

Then open **http://localhost:3000** in your browser.

---

## Demo Studies

The viewer includes five built-in synthetic patients — no login or DICOM server needed:

| Patient | MRN | Study type |
|---------|-----|------------|
| Smith, John | DENT-001 | Periapical X-ray (Tooth #14, #15) |
| Jones, Mary | DENT-002 | Full Mouth Panoramic |
| Williams, Robert | DENT-003 | Bitewing X-ray |
| Brown, Patricia | DENT-004 | Periapical Root Canal (Tooth #19, #20) |
| Davis, Linda | DENT-005 | Cephalometric Orthodontic Assessment |

---

## Dental Features

- **Dental mode** — 2×2 hanging protocol (current, prior, bitewing left, bitewing right)
- **Measurements palette** — preset tool labels: PA length, Canal angle, Crown width, Root length
- **Tooth selector** — FDI and Universal numbering systems
- **Measurement persistence** — measurements are saved to the backend and restored when you reopen a study
- **JSON export** — download all measurements for a study as JSON
- **Study preview** — tooth arch diagram with highlighted teeth in the worklist

---

## Configuration

The viewer config lives at:

```
Viewers/platform/app/public/config/default.js
```

Key settings:

```js
defaultDataSourceName: 'dentalDemo'   // uses built-in synthetic data
```

The backend URL used by the frontend is set in:

```
Viewers/extensions/dental/src/measurementSync.ts
```

```ts
const BACKEND_URL = 'http://localhost:3001';
```

Change this if you deploy the backend to a different host or port.

---

## Troubleshooting

**Measurements not saving**
- Make sure the backend is running on port 3001 before opening the viewer.
- Check the browser console for `fetch` errors.
- Verify the backend is healthy: `curl http://localhost:3001/api/health`

**Viewer shows blank screen**
- Ensure Node.js >= 24 is active: `node --version`
- Run `pnpm install` again from `dental/Viewers/`

**Port already in use**
- Viewer port: set `OHIF_PORT=3001` environment variable before `pnpm dev`
- Backend port: edit `PORT` at the top of `dental/backend/server.js`
