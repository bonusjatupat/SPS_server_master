FROM node:11.13.0
RUN mkdir /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3030
CMD ["npm", "start"]