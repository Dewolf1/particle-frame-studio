import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

async function run() {
  const serverPath = path.resolve(".output/server/index.mjs");
  if (!fs.existsSync(serverPath)) {
    console.log("No .output/server/index.mjs found.");
    return;
  }

  const port = 3899;
  const server = spawn("node", [serverPath], {
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const killServer = () => {
    try {
      server.kill("SIGKILL");
    } catch {}
  };

  try {
    // Wait for server to respond
    let html = null;
    for (let attempt = 0; attempt < 25; attempt++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        html = await new Promise((resolve, reject) => {
          const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
          });
          req.on("error", reject);
          req.setTimeout(500, () => {
            req.destroy();
            reject(new Error("Timeout"));
          });
        });
        if (html && html.includes("<html")) {
          break;
        }
      } catch {
        // Retry
      }
    }

    killServer();

    if (!html || !html.includes("<html")) {
      throw new Error("Failed to capture HTML from server");
    }

    // Ensure output directories exist
    fs.mkdirSync(".output/public", { recursive: true });
    fs.mkdirSync("dist", { recursive: true });

    // Write index.html, 200.html, and 404.html to both .output/public and dist
    fs.writeFileSync(".output/public/index.html", html);
    fs.writeFileSync(".output/public/200.html", html);
    fs.writeFileSync(".output/public/404.html", html);

    // Copy entire .output/public into dist/ for static hosts (Render Static Sites, Netlify, etc.)
    fs.cpSync(".output/public", "dist", { recursive: true });

    console.log("✓ Successfully generated index.html, 200.html, and dist/ for Render!");
    process.exit(0);
  } catch (err) {
    killServer();
    console.error("Prerender error:", err);
    process.exit(1);
  }
}

run();
