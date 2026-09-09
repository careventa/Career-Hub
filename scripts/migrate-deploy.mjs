import { spawn } from "node:child_process";

const maxAttempts = 5;
const delayMs = 5000;
const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function runMigration() {
  return new Promise((resolve) => {
    const child = spawn(prismaCommand, ["--no-install", "prisma", "migrate", "deploy"], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  console.log(`Prisma migration attempt ${attempt}/${maxAttempts}`);
  const code = await runMigration();
  if (code === 0) process.exit(0);
  if (attempt < maxAttempts) {
    console.log(`Migration did not complete. Retrying in ${delayMs / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

console.error("Prisma migrations failed after all retry attempts.");
process.exit(1);
