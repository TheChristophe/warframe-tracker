FROM node:17 as base

WORKDIR /app
COPY ["package.json", "yarn.lock*", "next.config.js", "next-env.d.ts", "tsconfig.json", ".eslintrc.json", ".prettierrc", "postcss.config.js", "tailwind.config.js", "./"]
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn install
COPY [".env", "./"]
COPY public public
COPY styles styles
#COPY model model
COPY pages pages
COPY components components
COPY utility utility
COPY api api

FROM base as production
ENV NODE_ENV=production

RUN yarn build
CMD ["yarn", "start"]

FROM base as development
ENV NODE_ENV=development

CMD [ "yarn", "dev" ]
