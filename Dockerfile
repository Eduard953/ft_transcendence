FROM node:18

RUN apt-get install unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18
COPY pong.zip .

RUN unzip pong.zip \
	&& rm -f pong.zip

WORKDIR /pong

RUN npm install \
	&& npm install -g npm@10.0.0 \
	&& npm install typescript tsc \
	&& npm i \
	&& npx tsc

EXPOSE 11080

CMD [ "npm", "start" ]