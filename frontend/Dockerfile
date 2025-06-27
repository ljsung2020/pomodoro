FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

# ✅ vite를 전역 설치 (실행 권한 확보)
RUN npm install -g vite && npm install --legacy-peer-deps

COPY . .

RUN vite build  # 또는 npm run build도 가능해짐

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
