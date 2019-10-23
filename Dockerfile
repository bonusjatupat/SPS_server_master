FROM node:8.16.2-alpine
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY . /app
EXPOSE 3030
CMD ["npm", "start"]