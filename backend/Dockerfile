FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:22-alpine

# npm n'est pas utilisé à l'exécution et embarque des dépendances vulnérables
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
	/usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js ./

USER node

EXPOSE 3002

CMD ["node", "server.js"]
