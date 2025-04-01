import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// New Relic doesn't work with Bun so disable it in dev
if (isProduction) {
  await import("newrelic");
}

export {};
