import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://127.0.0.1:4173";
const LOGIN_URL = `${BASE_URL}/login`;
const ARTIFACT_DIR = path.join(__dirname, "smoke-artifacts");

const cases = [
  {
    label: "coordinator",
    email: "coordinator1@gmail.com",
    password: "password123",
    expectedPath: "/coordinator/dashboard",
  },
  {
    label: "manager",
    email: "manager1@gmail.com",
    password: "password123",
    expectedPath: "/manager/dashboard",
  },
  {
    label: "user",
    email: "user1@gmail.com",
    password: "password123",
    expectedPath: "/unauthorized",
  },
];

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // ignore while booting
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for dev server at ${url}`);
}

function startDevServer() {
  const isWin = process.platform === "win32";
  const child = isWin
    ? spawn("npm run dev -- --host 127.0.0.1 --port 4173 --strictPort", {
        cwd: __dirname,
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
      })
    : spawn(npmCmd, ["run", "dev", "--", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
        cwd: __dirname,
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
      });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[dev] ${chunk}`);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[dev-err] ${chunk}`);
  });

  return child;
}

async function runCase(browser, testCase) {
  const context = await browser.newContext();
  const page = await context.newPage();
  let pass = false;
  let actualPath = "";
  let error = null;

  try {
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.fill('input[name="email"]', testCase.email);
    await page.fill('input[name="password"]', testCase.password);
    await Promise.all([
      page.locator('button[type="submit"]').click(),
      page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => null),
    ]);

    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      actualPath = new URL(page.url()).pathname;
      if (actualPath !== "/login") break;
      await page.waitForTimeout(300);
    }

    actualPath = new URL(page.url()).pathname;
    pass = actualPath === testCase.expectedPath;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const screenshotPath = path.join(ARTIFACT_DIR, `${testCase.label}-post-login.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await context.close();

  return {
    ...testCase,
    pass,
    actualPath,
    screenshotPath,
    error,
  };
}

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const server = startDevServer();

  try {
    await waitForServer(LOGIN_URL, 90000);

    const browser = await chromium.launch({ headless: true });
    try {
      const results = [];
      for (const testCase of cases) {
        const result = await runCase(browser, testCase);
        results.push(result);
      }

      const reportPath = path.join(ARTIFACT_DIR, "smoke-report.json");
      await writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

      console.log("\n=== Smoke Test Results ===");
      for (const r of results) {
        console.log(
          `${r.label}: ${r.pass ? "PASS" : "FAIL"} | expected=${r.expectedPath} | actual=${r.actualPath || "<none>"} | screenshot=${r.screenshotPath}${r.error ? ` | error=${r.error}` : ""}`,
        );
      }
      console.log(`Report: ${reportPath}`);
    } finally {
      await browser.close();
    }
  } finally {
    if (!server.killed) {
      if (process.platform === "win32" && server.pid) {
        spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
          stdio: "ignore",
        });
      } else {
        server.kill("SIGTERM");
      }
    }
  }
}

main().catch((err) => {
  console.error("Smoke test execution failed:", err);
  process.exitCode = 1;
});
