import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

// Helper to disable plugins in the 'nitro' environment to prevent duplicate heavy builds and OOM issues
function envFilter(plugins: any, filterFn: (envName: string) => boolean) {
  const arr = Array.isArray(plugins) ? plugins : [plugins];
  return arr.flat().map((p: any) => {
    if (!p) return p;
    return {
      ...p,
      applyToEnvironment(environment: any) {
        if (!filterFn(environment.name)) {
          return false;
        }
        if (typeof p.applyToEnvironment === "function") {
          return p.applyToEnvironment(environment);
        }
        return true;
      }
    };
  });
}

export default defineConfig({
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  plugins: [
    envFilter(tailwindcss(), (name) => name !== "nitro"),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      server: { entry: "server" },
    }),
    nitro(),
    envFilter(react(), (name) => name !== "nitro"),
  ],
  server: {
    host: "::",
    port: 8080,
  },
});
