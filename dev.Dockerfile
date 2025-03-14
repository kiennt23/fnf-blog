# syntax = docker/dockerfile:1

FROM oven/bun:latest AS base

RUN useradd -ms /bin/sh -u 1001 app
USER app

ENV NODE_ENV="development"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Node.js app lives here
COPY --chown=app:app . /app
WORKDIR /app

RUN bun install
RUN bunx prisma generate

EXPOSE 3000
EXPOSE 10000
CMD [ "bun", "--watch", "--hot", "--verbose-error-trace", "src/server.ts" ]

