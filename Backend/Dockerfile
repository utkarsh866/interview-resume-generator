FROM ghcr.io/puppeteer/puppeteer:24

WORKDIR /app

# Copy package files and install with legacy-peer-deps to avoid Windows lockfile conflicts
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
