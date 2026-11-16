import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { readExecutionProfile } from "./execution-profile.mjs";
import { prepareCodingEditor } from "./prepare-coding-editor.mjs";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");
const localWranglerConfig = resolve(fileURLToPath(new URL("..", import.meta.url)), ".wrangler", "config");
process.env.XDG_CONFIG_HOME ??= localWranglerConfig;
process.env.WRANGLER_LOG_PATH ??= resolve(localWranglerConfig, "logs");
const managedLinux = readExecutionProfile() === "managed-linux";
prepareCodingEditor(command === "build");

if (managedLinux && command === "build") {
  const result = spawnSync("bash", [
    fileURLToPath(new URL("./build-verified.sh", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Import in this process so the preview owner retains its PID and signals.
const cli = new URL(managedLinux
  ? "../node_modules/vite/bin/vite.js"
  : "../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), command,
  ...(!managedLinux && command === "dev" ? ["--port", "5173"] : []), ...args];
await import(cli.href);
