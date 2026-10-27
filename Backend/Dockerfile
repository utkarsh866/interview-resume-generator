FROM ghcr.io/puppeteer/puppeteer:24

USER root

WORKDIR /app

COPY package*.json ./

RUN chown -R pptruser:pptruser /app

USER pptruser

RUN npm install --omit=dev --legacy-peer-deps

COPY --chown=pptruser:pptruser . .

EXPOSE 3000

CMD ["npm", "start"]