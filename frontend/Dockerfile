FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

# 🔧 package-lock.json이 없어 실패하는 경우를 대비해 --legacy-peer-deps 옵션 추가
RUN npm install --legacy-peer-deps

COPY . .

# 🔧 vite가 없으면 여기서 실패하므로 확인 용이
RUN npx vite build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
