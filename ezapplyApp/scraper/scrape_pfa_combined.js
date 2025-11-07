import puppeteer from "puppeteer";
import fs from "fs/promises";

const BASE_URL = "https://www.pfa.org.ph/members";

function normalizeMoney(value) {
  if (!value) return null;
  let str = value.toString().trim().toUpperCase();

  // remove symbols
  str = str.replace(/[^0-9.,KM\-– ]/g, "");

  // handle ranges like "3M - 5M"
  if (str.includes("-") || str.includes("–")) {
    const parts = str.split(/[-–]/).map((p) => normalizeMoney(p.trim()));
    return Math.round((parts[0] + (parts[1] || parts[0])) / 2); // average
  }

  // detect "M" or "K"
  let num = parseFloat(str.replace(/,/g, ""));
  if (isNaN(num)) return null;

  if (str.includes("M")) num *= 1_000_000;
  else if (str.includes("K")) num *= 1_000;

  return Math.round(num);
}

// ✅ Auto-scroll to load all companies
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}

(async () => {
  console.log("🌐 Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🔗 Visiting ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 0 });

  console.log("⏳ Scrolling to load all members...");
  await autoScroll(page);
  await new Promise((r) => setTimeout(r, 3000)); // small buffer

  console.log("📦 Extracting company cards...");
  const members = await page.$$eval('li[data-hook="product-list-grid-item"]', (cards) =>
    cards.map((card) => {
      const name = card.querySelector('[data-hook="product-item-name"]')?.textContent?.trim() || "";
      const price = card.querySelector('[data-hook="product-item-price-to-pay"]')?.textContent?.trim() || "";
      const img = card.querySelector("img")?.src || "";
      const link = card.querySelector("a[data-hook='product-item-container']")?.href || "";
      return { name, price, img, link };
    })
  );

  console.log(`✅ Found ${members.length} franchise listings`);
  let detailed = [];

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    console.log(`➡️ [${i + 1}/${members.length}] Scraping ${m.name}`);
    try {
      await page.goto(m.link, { waitUntil: "networkidle2", timeout: 0 });

      // structured info (capital, franchise fee, etc.)
      let info = {};
      try {
        await page.waitForSelector("ul[data-hook='stacked-info-section']", { timeout: 5000 });
        info = await page.$$eval("li[data-hook='stacked-info-item']", (items) => {
          let data = {};
          items.forEach((li) => {
            const title = li.querySelector("h2")?.textContent?.trim().toUpperCase();
            const value = li.querySelector("div p")?.textContent?.trim();
            if (title && value) data[title] = value;
          });
          return data;
        });
      } catch {
        console.warn("⚠️ No structured info found for", m.name);
      }
      
      if (info["CAPITAL INVESTMENT"]) info["CAPITAL INVESTMENT"] = normalizeMoney(info["CAPITAL INVESTMENT"]);
      if (info["FRANCHISE FEE"]) info["FRANCHISE FEE"] = normalizeMoney(info["FRANCHISE FEE"]);


      // extra info (description/contact)
      const extra = await page.evaluate(() => {
        const description =
          document.querySelector('[data-hook="description"]')?.innerText?.trim() ||
          document.querySelector('[data-hook="product-description"]')?.innerText?.trim() ||
          "";
        const contact = Array.from(document.querySelectorAll("p"))
          .map((p) => p.innerText)
          .find((t) => t.match(/@|contact|tel|email|www|address|facebook/i)) || "";
        return { description, contact };
      });

      detailed.push({ ...m, ...info, ...extra });
    } catch (err) {
      console.warn(`❌ Failed ${m.name}: ${err.message}`);
      detailed.push(m);
    }
  }

  await fs.writeFile("pfa_members_combined.json", JSON.stringify(detailed, null, 2));
  console.log("💾 Saved data to pfa_members_combined.json");

  await browser.close();
})();