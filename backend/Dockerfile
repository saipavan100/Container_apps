FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
CMD ["npm","start"]

# Expose application port and OpenTelemetry metrics port
EXPOSE 8080
EXPOSE 9464