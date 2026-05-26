import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const SOURCE_URL = "https://ruankaodaren.com/exam/#/knowlegde";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const authDir = resolve(repoRoot, ".auth");
const authStatePath = resolve(authDir, "ruankaodaren.storageState.json");
const authStateRelativePath = ".auth/ruankaodaren.storageState.json";

function log(message: string): void {
  console.log(`[auth] ${message}`);
}

function warn(message: string): void {
  console.warn(`[auth][warning] ${message}`);
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function detectLoginSignals(url: string, text: string): { detected: boolean; matchedTerms: string[] } {
  const terms = ["登录", "立即登录", "未登录", "请先登录", "switchAccounts", "login", "sign in"];
  const haystack = `${url}\n${text}`.toLowerCase();
  const matchedTerms = terms.filter((term) => haystack.includes(term.toLowerCase()));

  return {
    detected: matchedTerms.length > 0,
    matchedTerms
  };
}

async function main(): Promise<void> {
  await mkdir(authDir, { recursive: true });

  log("opening browser");
  const browser = await chromium.launch({ headless: false });

  try {
    const context = await browser.newContext({
      viewport: { width: 1365, height: 768 }
    });
    const page = await context.newPage();

    await page.goto(SOURCE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30_000
    });

    try {
      await page.waitForLoadState("networkidle", { timeout: 20_000 });
    } catch {
      warn("networkidle wait timed out; continue manual login in the visible browser");
    }

    log("waiting for manual login");
    console.log("Complete login manually in the opened browser window.");
    console.log(
      "If an exam/category selection page appears, select 系统架构设计师 and confirm the knowledge page is visible before pressing Enter."
    );
    console.log("After login is complete or after the target page has loaded, press Enter here to save storage state.");

    const readline = createInterface({ input, output });
    try {
      await readline.question("");
    } finally {
      readline.close();
    }

    const currentUrl = page.url();
    const bodyText = await page
      .locator("body")
      .innerText({ timeout: 5_000 })
      .catch(() => "");
    const loginSignals = detectLoginSignals(currentUrl, bodyText);

    if (loginSignals.detected) {
      warn(
        `login-related signal still detected before saving storage state: ${loginSignals.matchedTerms.join(", ")}`
      );
      warn("storage state will still be saved because some sites require a later refresh to apply login state");
    }

    log("saving storage state");
    await context.storageState({ path: authStatePath });

    log(`auth state saved: ${authStateRelativePath}`);
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(`[auth][error] ${formatError(error)}`);
  process.exit(1);
});
