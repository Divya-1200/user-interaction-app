FROM node:14

WORKDIR /app

COPY . .

RUN npm config set legacy-peer-deps true

RUN npm install 


EXPOSE 3000

CMD ["npm", "start"]


