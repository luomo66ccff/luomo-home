FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=7891
ENV HOSTNAME=0.0.0.0
EXPOSE 7891
CMD npm run start
