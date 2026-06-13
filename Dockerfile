FROM node:20-alpine
WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci

COPY . .

# Build shared → db (prisma generate + tsc) → api, via turbo dependency order
RUN npx turbo run build --filter=@enge-pro/api...

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy --schema ./packages/db/prisma/schema.prisma && node apps/api/dist/app.js"]
