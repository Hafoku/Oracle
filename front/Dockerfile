# ORACLE/front/Dockerfile

# Этап 1: Сборка React приложения
FROM node:18-alpine AS builder
WORKDIR /app

# Копируем package.json и package-lock.json из корневого контекста (ORACLE/)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install
RUN npm install react-beautiful-dnd
# Копируем исходный код frontend из папки front/ (относительно корневого контекста)
COPY front/ .
# ВАЖНО: Убедись, что твоя команда npm run build (в корневом package.json)
# корректно собирает приложение, когда исходники находятся в текущей директории (/app),
# а не в подпапке /app/front. Возможно, пути в скриптах сборки или конфигах (webpack, etc.)
# нужно будет адаптировать, или же здесь немного изменить структуру копирования.
# Например, если npm run build ожидает, что он запускается из папки, где лежит код фронтенда:
# WORKDIR /app/front # (после COPY front/ /app/front)
# COPY package*.json /app/ # (если package.json все еще в корне)
# RUN npm install # (если зависимости нужны именно в /app/front)

# Собираем статические файлы для продакшена
# Эта команда будет использовать package.json, скопированный на шаге выше
RUN npm run build
# Убедись, что результат сборки (обычно папка 'build' или 'dist')
# создается в /app/build

# Этап 2: Сервировка статитики через Nginx
FROM nginx:stable-alpine

# Копируем собранные статические файлы из /app/build (путь может отличаться)
COPY --from=builder /app/build /usr/share/nginx/html

# (Опционально) Если у тебя есть кастомный nginx.conf в папке front/
# COPY front/nginx.conf /etc/nginx/conf.d/default.conf
# Если используешь, убедись, что nginx.conf корректно настроен для прокси на backend

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]