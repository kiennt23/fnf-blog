# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
FROM oven/bun:slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install node modules
COPY package-lock.json package.json ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN bunx webpack --config webpack.fe.config.js


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "backend/index.ts" ]
