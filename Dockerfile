FROM node:slim
WORKDIR /usr/src/app
RUN apt update && apt install -y git wget python3 build-essential
RUN git clone https://github.com/alexavil/DoppelBot.git /usr/src/app
RUN npm install
RUN chmod 777 /usr/src/app/scripts/*
RUN mkdir /usr/src/app/guilds
RUN mkdir /usr/src/app/filter
CMD node app.js