# Clinical Note Coding Pipeline

## Overview
This project implements a backend pipeline that takes a **clinical note** as input and produces a set of **probable ICD codes** and **supporting guideline matches**. The system is designed to demonstrate how natural language processing, semantic retrieval, and rule-based reasoning can be combined to support clinical coding.

## Development Background
- The system took about **3 and 1/2** hours to develop across a 1 and 1/2 day interval.
- The system was developed alongside Microsoft Copilot (in the browser, not an IDE plugin) which:

  1. Helped validate my tech stack of choice - dependencies e.t.c
  2. Helped speed up code structure - patterns, decisions, classes, interfaces and tiny bootup scripts
  3. Helped troubleshoot multiple Dockerfile setup and build issues.

- Challenges I faced include:
  1. Dockerization gave me multiple timeouts coz of my region's internet speed caping.
  2. Issues with ChromaDB install and running on my Windows dev machine.
  3. Initial trouble understanding the dataset.

- Because of the challenges, this system assumes the input files are JSON (A JSON string array), or a multiline txt file.

The flow is:

1. **Clinical note in**  
2. **Tokenizer** → normalize and stem text  
3. **Retriever** → embed note and query ChromaDB collections  
4. **Reasoner** → score, filter, and detect conflicts among matches  
5. **Formatter** → produce a clean JSON schema with status and ranked candidates  

The endpoint exposed is `/process`.

---

## Architecture

- **TokenizerService**  
  Uses the `natural` package for multilingual tokenization and stemming. Supports English, Spanish, French, and German. Produces normalized tokens from the input note.

- **RetrieverService**  
  Uses `OpenAIEmbeddings` to embed the note and queries two ChromaDB collections:  
  - `icd_catalog` (ICD codes)  
  - `guideline_snippets` (clinical guidelines)  
  Returns typed objects (`ICDMatch`, `GuidelineMatch`) with IDs, titles, synonyms, and distances.

- **ReasonerService**  
  Applies confidence scoring (`1 / (1 + distance)`), boosts matches if direct symptom terms are found, filters out low-confidence entries, and flags conflicts (e.g., “fever of unknown origin” vs “pneumonia”). Produces structured arrays of codes and guidelines with confidence and rationale.

- **FormatterService**  
  Sorts candidates by confidence, applies a certainty threshold, and outputs a clean JSON schema.  
  - If the top ICD code confidence ≥ 0.7 → `status: "ok"`  
  - Otherwise → `status: "uncertain"`  
  Guidelines are supportive but do not override ICD certainty.

- **PipelineService**  
  Orchestrates the chain: Tokenizer → Retriever → Reasoner → Formatter. The controller only calls this service.

---

## Endpoint

### Request
```json
POST /process
{
  "note": "Patient has fever and cough.",
  "language": "English"
}
```

### Response
```json
{
  "message": "Note processed successfully",
  "tokens": ["patient","ha","fever","and","cough"],
  "retrievalResults": { ... },
  "reasoned": { ... },
  "formatted": {
    "status": "ok",
    "probableCodes": [
      { "code": "CA22", "title": "Pneumonia, organism unspecified", "confidence": 0.82, "rationale": "..." }
    ],
    "probableGuidelines": [
      { "title": "Community-acquired pneumonia", "confidence": 0.90, "rationale": "..." }
    ]
  }
}
```

---

## Design Choices

- **Confidence threshold (0.7)**  
  We deliberately require ICD codes to exceed 0.7 confidence before marking `status: "ok"`. Even if guidelines are strong, the final deliverable is a code assignment, so ICD confidence is the deciding factor. This explains why some pneumonia cases return `"uncertain"` — the ICD score was below threshold.

- **Hard-coded boosts**  
  We added simple regex boosts for terms like “fever” and “cough” to demonstrate confidence adjustment. These are illustrative, not exhaustive. If the test data contains other symptoms (e.g., headache, dizziness), the system still works — it falls back to distance-based confidence. This is documented here to show awareness of generalization limits.

- **Uncertainty handling**  
  When no ICD code clears the threshold, the system outputs `status: "uncertain"` and provides all candidates with rationale. This makes ambiguity explicit rather than silently picking a weak code.

- **Extensibility**  
  The pipeline is modular. More sophisticated reasoning (rule engines, probabilistic models) can be added later without changing the controller.

---

## Example Calls

- **Clear pneumonia case**
```json
{
  "note": "Patient presents with productive cough, fever, and chest consolidation.",
  "language": "English"
}
```
→ Likely `"uncertain"` if ICD confidence < 0.7, even though guidelines are strong.

- **Ambiguous headache case**
```json
{
  "note": "Patient reports persistent headache and dizziness.",
  "language": "English"
}
```
→ `"uncertain"`, multiple codes around 0.45–0.5 confidence.

- **Classic fever/cough case**
```json
{
  "note": "Patient has fever and cough.",
  "language": "English"
}
```
→ `"ok"`, pneumonia/cough codes at high confidence.

---

## Running the CLI in Docker

> The Docker image is based on Ubuntu 22.04 image. We install Python, ChromaDB and NodeJS. This is slower but ensures reproducibility of the image.

---

## Key Improvements

- **Base image**: `node:20-bullseye` → Node preinstalled, Debian mirrors more reliable.  
- **apt options**: `Acquire::Retries` and `ForceIPv4` → avoids long hangs.  
- **Chroma ingestion**: runs against ChromaDB directly, not NestJS. No fragile background Nest process.  
- **Cleanup**: removed unused `APP_PORT` and `CHROMA_DB_PORT` envs. Only keep what you actually use.  
- **No EXPOSE**: since reviewers only run CLI inside the container, we don’t expose ports.

---

### Running in Docker

This image is based on Node LTS (20) with Python + ChromaDB installed. Test vectors are pre‑loaded into `/app/db` during build.

- **File of notes (JSON)**:

Assuming you have a notes.json directly in your computer somewhere:
  ```bash
  docker run -e OPENAI_API_KEY=$OPENAI_API_KEY \
    -v $(pwd)/notes.json:/app/notes.json \
    clinical-pipeline
  ```
This mounts your local notes.json into the container at /app/notes.json. The CLI then runs against it.

- **File of notes (TXT)**:
For a multi-line text (.txt) file somewhere on your computer:
  ```bash
  docker run -e OPENAI_API_KEY=$OPENAI_API_KEY \
    -v $(pwd)/notes.txt:/app/notes.txt \
    clinical-pipeline \
    node dist/cli.js /app/notes.txt
  ```

- **Single Inline Test**:
To see results for a single test:
```bash
docker run -e OPENAI_API_KEY=$OPENAI_API_KEY \
  clinical-pipeline \
  node dist/cli.js dummy.txt "Patient has fever and cough."
```
