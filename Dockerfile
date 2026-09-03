FROM node:24-bookworm

# Args and envs
ENV OPENAI_MODEL="text-embedding-3-small"
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV CHROMA_DB_PORT=8000

# Install Python + pip
RUN apt-get update -o Acquire::Retries=3 -o Acquire::ForceIPv4=true \
    && apt-get install -y python3 python3-pip supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install ChromaDB
RUN pip3 install --break-system-packages chromadb fastapi uvicorn opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation opentelemetry-instrumentation-fastapi

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

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Pre-populate ChromaDB by calling injest.js directly
# Start ChromaDB server in background, wait until ready, ingest files, then stop
RUN chroma run --path /app/db --port 8000 & \
    pnpm run start:prod & \
    sleep 10 && \
    node dist/injest.js ./data/icd_catalog.json ICD_CATALOG && \
    node dist/injest.js ./data/guideline_snippets.json GUIDELINE_SNIPPET && \
    pkill -f "chroma run" && \
    pkill -f "node dist/main.js"

EXPOSE 3000

CMD ["supervisord", "-n"]
