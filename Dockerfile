FROM node
WORKDIR /app

COPY ["package.json", "yarn.lock", "rollup.config.js", "./"]
RUN yarn install

COPY . .
ENV NODE_ENV=production
RUN yarn run build


EXPOSE 5000
CMD [ "yarn", "run", "start"]