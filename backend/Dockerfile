FROM node:18

WORKDIR /app
COPY . .

RUN npm install --legacy-peer-deps

# ⚠️ Generate Prisma client trong container Linux để đúng môi trường
RUN npx prisma generate

CMD ["npm", "run", "start:dev"]
