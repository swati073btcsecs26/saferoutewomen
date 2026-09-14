# SafeRoute AI - backend API
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
RUN npm install --omit=dev

# Copy source
COPY src ./src

ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/server.js"]
