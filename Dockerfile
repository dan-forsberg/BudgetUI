FROM node
ENV NODE_ENV=production
WORKDIR /app

COPY ["package.json", "yarn.lock", "rollup.config.js", "./"]
RUN yarn install

COPY ./src ./src
COPY ./public ./public

RUN yarn run build

EXPOSE 5000

CMD [ "yarn", "run", "start"]