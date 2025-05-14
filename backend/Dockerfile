FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps && npm install -g nodemon
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"] 