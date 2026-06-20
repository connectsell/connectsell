/**
 * Headless PDF export for preset reports.
 * Usage: node generate-pdf.mjs
 */
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "index.html");
const pdfPath = path.join(__dirname, "공동구매_운영리포트_@sohadam.baka_2026.06.13.pdf");

if (!fs.existsSync(htmlPath)) {
  console.error("index.html not found:", htmlPath);
  process.exit(1);
}

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 920, height: 1400, deviceScaleFactor: 2 });

const client = await page.createCDPSession();
await client.send("Page.setDownloadBehavior", {
  behavior: "allow",
  downloadPath: __dirname,
});

await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}?autopdf=1`, {
  waitUntil: "networkidle0",
  timeout: 120000,
});

await page.waitForFunction(
  () => !document.getElementById("btn-pdf")?.disabled,
  { timeout: 120000 }
).catch(() => {});

await new Promise((r) => setTimeout(r, 3000));

const downloaded = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith(".pdf") && f.includes("공동구매"))
  .map((f) => ({ f, m: fs.statSync(path.join(__dirname, f)).mtimeMs }))
  .sort((a, b) => b.m - a.m)[0];

if (downloaded) {
  const src = path.join(__dirname, downloaded.f);
  if (src !== pdfPath) fs.renameSync(src, pdfPath);
  console.log("PDF saved:", pdfPath);
} else {
  console.warn("Auto PDF download not detected; generating via print fallback…");
  await page.emulateMediaType("print");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
  });
  console.log("PDF saved (fallback):", pdfPath);
}

await browser.close();
