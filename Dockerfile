FROM node:16.1-buster-slim as builder

WORKDIR /usr/app

COPY . ./

RUN rm -rf /usr/app/node_modules

RUN apt-get update && apt-get install -y git

RUN yarn --pure-lockfile
RUN yarn build
RUN rm -rf /usr/app/node_modules


FROM node:16.1-buster-slim as runner

WORKDIR /usr/app

RUN apt-get update && apt-get install -y git

COPY --from=builder /usr/app/lib /usr/app/lib
COPY --from=builder /usr/app/build /usr/app/build
COPY --from=builder /usr/app/package.json /usr/app/package.json
COPY --from=builder /usr/app/yarn.lock /usr/app/yarn.lock

RUN yarn install --production

CMD ["node", "/usr/app/build/main.js"]