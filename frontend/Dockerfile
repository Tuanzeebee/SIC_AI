FROM node:18

WORKDIR /app
COPY . .

ENV NODE_ENV=development

RUN npm install --legacy-peer-deps

CMD ["npx", "vite", "--host"]
