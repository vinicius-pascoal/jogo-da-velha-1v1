FROM node:20-alpine AS base

# Dependências
FROM base AS deps
WORKDIR /app

COPY package.json ./
RUN npm install

# Builder
FROM base AS builder
WORKDIR /app

# Build args para variáveis de ambiente Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ABLY_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ABLY_KEY=$NEXT_PUBLIC_ABLY_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir -p .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
