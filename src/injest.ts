#!/usr/bin/env node

import * as fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

const filePath = process.argv[2];
const type = process.argv[3]; // "ICD_CATALOG" or "GUIDELINE_SNIPPET"

if (!filePath || !type) {
  console.error('Usage: node dist/injest.js <filePath> <ICD_CATALOG|GUIDELINE_SNIPPET>');
  process.exit(1);
}

(async () => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('type', type);

  const res = await fetch('http://localhost:3000/injest', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    console.error(`Failed to ingest ${filePath}: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const json = await res.json();
  console.log(`Ingested ${filePath} as ${type}:`, json);
})();
