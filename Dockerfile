FROM node:20-bullseye

ENV OPENAI_MODEL="text-embedding-3-small"
ENV OPENAI_API_KEY=""
ENV CHROMA_DB_PORT=8000

# Install Python + pip
RUN apt-get update -o Acquire::Retries=3 -o Acquire::ForceIPv4=true \
    && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install ChromaDB
RUN pip3 install chromadb fastapi uvicorn

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN pnpm install

# Copy source
COPY . .

# Build project
RUN pnpm build

# Copy test data
COPY data ./data

# Pre-populate ChromaDB by calling injest.js directly
# Start ChromaDB server in background, wait until ready, ingest files, then stop
RUN python3 -m chromadb.server.fastapi --path /app/db --port 8000 & \
    sleep 8 && \
    node dist/injest.js ./data/icd_catalog.json ICD_CATALOG && \
    node dist/injest.js ./data/guideline_snippets.json GUIDELINE_SNIPPET && \
    pkill -f "chromadb.server.fastapi"

# Default command: run ChromaDB and CLI
CMD ["sh", "-c", "python3 -m chromadb.server.fastapi --path /app/db --port 8000 & node dist/cli.js /app/notes.json"]
