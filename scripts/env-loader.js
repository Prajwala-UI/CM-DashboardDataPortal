const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const envType = process.env.REACT_APP_ENV || "local";
const envFile = `.env.${envType}`;
const envPath = path.resolve(__dirname, "..", envFile);

console.log(`[Env Loader] Active Environment: ${envType}`);
console.log(`[Env Loader] Loading variables from ${envFile}...`);

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const delimiterIndex = trimmed.indexOf("=");
      if (delimiterIndex !== -1) {
        const key = trimmed.substring(0, delimiterIndex).trim();
        let value = trimmed.substring(delimiterIndex + 1).trim();
        
        // Strip wrapping double or single quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        
        if (key.startsWith("REACT_APP_") || key === "PORT" || key === "PUBLIC_URL" || key === "BUILD_OUT_DIR") {
          // Only set it if it's not already defined in the process.env
          if (process.env[key] === undefined) {
            process.env[key] = value;
            // Mask password or passphrase values in console logs
            const displayValue = key.toLowerCase().includes("password") || key.toLowerCase().includes("passphrase")
              ? "********"
              : value;
            console.log(`  -> Loaded: ${key} = ${displayValue}`);
          }
        }
      }
    }
  });
} else {
  console.warn(`[Env Loader] Warning: Env file ${envPath} not found.`);
}

// Get the command to run from the command-line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("[Env Loader] Error: No command specified to run.");
  process.exit(1);
}

const command = args.join(" ");
console.log(`[Env Loader] Executing command: ${command}`);

try {
  execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error(`[Env Loader] Command failed: ${command}`);
  process.exit(error.status || 1);
}
