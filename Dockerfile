FROM node:22-alpine AS base

WORKDIR /app
COPY [".yarn/releases", ".yarn/releases"]
COPY ["package.json", "yarn.lock*", "next.config.js", "next-env.d.ts", "tsconfig.json", ".eslintrc.json", ".prettierrc", "postcss.config.js", "tailwind.config.js", ".yarnrc.yml", "./"]
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn install
COPY [".env", "./"]
COPY public public
COPY styles styles
COPY lib lib
#COPY model model
COPY pages pages
COPY components components
COPY utility utility
COPY api api

FROM base AS prod-build

RUN yarn build

FROM node:20-alpine AS production
ENV NODE_ENV=production

WORKDIR /app
COPY --from=prod-build /app/package.json .
COPY --from=prod-build /app/yarn.lock .
COPY --from=prod-build /app/next.config.js .
COPY --from=prod-build /app/public ./public
COPY --from=prod-build /app/.next/static ./.next/static
COPY --from=prod-build /app/.next/standalone ./

EXPOSE 3000
CMD ["node", "server.js"]

FROM base AS development
ENV NODE_ENV=development

EXPOSE 3000
CMD [ "yarn", "dev" ]
