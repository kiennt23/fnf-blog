import { UserConfig } from "vite";

const commonConfig: UserConfig = {
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: "[hash:base64:5]", // Ensure CSS class names are preserved
    },
    transformer: "lightningcss",
    lightningcss: {
      cssModules: true,
    },
    devSourcemap: true,
  },
};

export default commonConfig;
