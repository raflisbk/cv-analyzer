FROM node:22-alpine AS deps
WORKDIR /srv/web
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /srv/web
COPY --from=deps /srv/web/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8000/yjs
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ARG BACKEND_URL=http://api:8000

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV BACKEND_URL=${BACKEND_URL}
ENV NEXT_OUTPUT=standalone

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /srv/web
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Copy standalone output
COPY --from=builder /srv/web/.next/standalone ./
COPY --from=builder /srv/web/.next/static ./.next/static
COPY --from=builder /srv/web/public ./public

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
