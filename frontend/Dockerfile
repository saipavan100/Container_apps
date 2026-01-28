FROM node:alpine as Builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
# For local: use nginx.conf, For Azure: use nginx.container-apps.conf
ARG NGINX_CONFIG=nginx.conf
COPY --from=Builder /app/build /usr/share/nginx/html
COPY ${NGINX_CONFIG} /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
