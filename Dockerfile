# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=23.6.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
RUN npm install -g bun

# Install node modules
COPY package-lock.json package.json ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN bunx webpack --config webpack.fe.config.js

# Final stage for app image
FROM build

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "backend/index.ts" ]
