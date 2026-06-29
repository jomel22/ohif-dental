const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DB_FILE = path.join(__dirname, 'data', 'measurements.json');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { measurements: {} };
  }
}

function writeDb(data) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/measurements', (req, res) => {
  const { studyInstanceUID } = req.query;
  const db = readDb();
  const all = Object.values(db.measurements);
  const results = studyInstanceUID
    ? all.filter(m => m.studyInstanceUID === studyInstanceUID)
    : all;
  res.json({ measurements: results });
});

app.get('/api/measurements/:uid', (req, res) => {
  const db = readDb();
  const measurement = db.measurements[req.params.uid];
  if (!measurement) return res.status(404).json({ error: 'Not found' });
  res.json(measurement);
});

app.post('/api/measurements', (req, res) => {
  const db = readDb();
  const measurement = {
    ...req.body,
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!measurement.uid) {
    return res.status(400).json({ error: 'uid is required' });
  }
  db.measurements[measurement.uid] = measurement;
  writeDb(db);
  res.status(201).json(measurement);
});

app.put('/api/measurements/:uid', (req, res) => {
  const db = readDb();
  const existing = db.measurements[req.params.uid];
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.measurements[req.params.uid] = {
    ...existing,
    ...req.body,
    uid: req.params.uid,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  res.json(db.measurements[req.params.uid]);
});

app.delete('/api/measurements/:uid', (req, res) => {
  const db = readDb();
  if (!db.measurements[req.params.uid]) {
    return res.status(404).json({ error: 'Not found' });
  }
  delete db.measurements[req.params.uid];
  writeDb(db);
  res.status(204).send();
});

app.delete('/api/measurements', (req, res) => {
  const { studyInstanceUID } = req.query;
  const db = readDb();
  if (studyInstanceUID) {
    Object.keys(db.measurements).forEach(uid => {
      if (db.measurements[uid].studyInstanceUID === studyInstanceUID) {
        delete db.measurements[uid];
      }
    });
  } else {
    db.measurements = {};
  }
  writeDb(db);
  res.status(204).send();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Dental backend running on http://localhost:${PORT}`);
});
