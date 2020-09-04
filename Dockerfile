# Compilation stage
FROM node:12 AS compilation

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./src ./src/
RUN npm ci --quiet && npm run build

# Deploy stage
FROM node:12
ARG mode

WORKDIR /app
ENV NODE_ENV=${mode}

COPY .env ./
COPY package*.json ./
RUN if [ "$mode" = "production" ] ; then npm ci --quiet --only=production ; else npm ci --quiet ; fi

COPY --from=compilation /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "/app/dist/server.js"]