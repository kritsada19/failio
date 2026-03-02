# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# ติดตั้ง dependencies ทั้งหมด (รวม dev)
COPY package*.json ./
RUN npm install

# คัดลอก source
COPY . .

# generate prisma client ก่อน build
RUN npx prisma generate

# build next app
RUN npm run build


# ---------- runner (production) ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# ติดตั้งเฉพาะ production deps
COPY package*.json ./
RUN npm install --omit=dev

# คัดลอกไฟล์ที่จำเป็นจาก builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "start"]