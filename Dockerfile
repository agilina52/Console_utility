FROM node:20-alpine

WORKDIR /app

COPY . .

# Runtime-зависимостей нет (используются только встроенные модули Node),
# поэтому шаг npm install не требуется.
ENV WEATHER_TIMEOUT_MS=5000 \
    WEATHER_REPORTS_DIR=reports \
    WEATHER_UNITS=metric

ENTRYPOINT ["node", "src/index.js"]
