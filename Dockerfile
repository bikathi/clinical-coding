FROM ubuntu:22.04

ENV OPENAI_MODEL="text-embedding-3-small"
ENV CHROMA_DB_PORT=8000
ENV OPENAI_API_KEY=""

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip curl gnupg
RUN pip3 install chromadb fastapi uvicorn

# Install Node + pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .

# Build project
RUN pnpm build

# Copy test data
COPY data ./data

# Pre-populate ChromaDB
RUN npm run start:prod && \
    sleep 8 && \
    node dist/injest.js ./data/icd_catalog.json ICD_CATALOG && \
    node dist/injest.js ./data/guideline_snippets.json GUIDELINE_SNIPPET && \
    pkill -f "node dist/main.js"

# Default command: run ChromaDB and CLI
CMD ["sh", "-c", "python3 -m chromadb.server.fastapi --path /app/db --port 8000 & node dist/cli.js /app/notes.json"]
