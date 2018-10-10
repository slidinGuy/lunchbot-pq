FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
ENTRYPOINT ["./set_test_env.sh"]
