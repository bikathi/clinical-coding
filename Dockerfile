FROM node:24-bookworm

# Args and envs
ENV OPENAI_MODEL="text-embedding-3-small"
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV PINECONE_API_KEY=$PINECONE_API_KEY
ENV PINECONE_ENV=$PINECONE_ENV

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


EXPOSE 3000

CMD ["pnpm", "start:prod"]