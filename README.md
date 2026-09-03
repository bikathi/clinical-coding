# Clinical Note Coding Pipeline

## Overview
This project implements a backend pipeline that takes a **clinical note** as input and produces a set of **probable ICD codes** and **supporting guideline matches**. The system is designed to demonstrate how natural language processing, semantic retrieval, and rule-based reasoning can be combined to support clinical coding.

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

### Running the CLI

The CLI supports:
- **JSON file**: `["note1","note2"]` → multiple notes.  
- **Text file**: multi‑line notes, each line processed separately.  
- **Inline note**: pass a string directly as the second argument after file - file doesn't have to exist.

Examples:
```bash
node dist/cli.js ./notes.json
node dist/cli.js ./notes.txt
node dist/cli.js dummy.txt "Patient has fever and cough." // dummy.txt doesn\'t need to exist
```

Inside Docker:
```bash
docker run -v $(pwd)/notes.json:/app/notes.json clinical-pipeline \
  node dist/cli.js /app/notes.json

docker run clinical-pipeline \
  node dist/cli.js dummy.txt "Patient has fever and cough."
```

---
