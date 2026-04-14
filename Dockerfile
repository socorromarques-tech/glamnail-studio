FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# 1. Copy prisma directory EXPLICITLY before generating
COPY prisma ./prisma/

# 2. Generate Prisma client
RUN npx prisma generate

# 3. Copy the rest of the source code
COPY . .

# 4. Build the application
RUN npm run build

# Production Environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "start"]
