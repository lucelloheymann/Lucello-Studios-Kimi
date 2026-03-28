// Crawl-Service: Playwright-basiertes Website-Crawling

import { chromium, type Browser, type Page as PlaywrightPage } from "playwright";
import { db } from "@/lib/db";
import { extractDomain, normalizeUrl } from "@/lib/utils";
import type { PageType } from "@/types";
import path from "path";
import fs from "fs/promises";
import { logCrawlStarted, logCrawlCompleted, logCrawlFailed } from "./audit.service";

const STORAGE_PATH = process.env.STORAGE_LOCAL_PATH || "./storage";
const TIMEOUT = parseInt(process.env.CRAWL_TIMEOUT_MS || "30000");
const MAX_PAGES = parseInt(process.env.CRAWL_MAX_PAGES || "10");

// ─── Seiten-Klassifizierung ───────────────────────────────────────────────────

const PAGE_TYPE_PATTERNS: Record<PageType, RegExp[]> = {
  HOME: [/^\/?$/, /\/index\/?$/, /\/home\/?$/],
  SERVICES: [/leistung|service|angebot|portfolio|produkt/i],
  ABOUT: [/über|about|team|unternehmen|wir-sind|profil/i],
  CONTACT: [/kontakt|contact|impressum|reach/i],
  REFERENCES: [/referenz|projekt|work|cases|portfolio|kunden/i],
  IMPRINT: [/impressum|legal|datenschutz|privacy/i],
  CAREER: [/karriere|jobs|stellenangebot|bewerbung|career/i],
  OTHER: [],
};

function classifyPage(url: string): PageType {
  const pathname = new URL(url).pathname;
  for (const [type, patterns] of Object.entries(PAGE_TYPE_PATTERNS)) {
    if (type === "OTHER") continue;
    for (const pattern of patterns) {
      if (pattern.test(pathname)) return type as PageType;
    }
  }
  return "OTHER";
}

function isHomePage(url: string, baseUrl: string): boolean {
  try {
    const u = new URL(url);
    const b = new URL(baseUrl);
    return u.hostname === b.hostname && (u.pathname === "/" || u.pathname === "");
  } catch {
    return false;
  }
}

// ─── Storage ──────────────────────────────────────────────────────────────────

async function saveScreenshot(
  companyId: string,
  buffer: Buffer,
  suffix: string
): Promise<string> {
  const dir = path.join(STORAGE_PATH, "screenshots", companyId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${suffix}-${Date.now()}.png`;
  const filepath = path.join(dir, filename);
  await fs.writeFile(filepath, buffer);
  return `/storage/screenshots/${companyId}/${filename}`;
}

async function saveHtml(
  companyId: string,
  html: string,
  suffix: string
): Promise<string> {
  const dir = path.join(STORAGE_PATH, "snapshots", companyId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${suffix}-${Date.now()}.html`;
  const filepath = path.join(dir, filename);
  await fs.writeFile(filepath, html, "utf-8");
  return `/storage/snapshots/${companyId}/${filename}`;
}

// ─── Page-Daten extrahieren ───────────────────────────────────────────────────

async function extractPageData(page: PlaywrightPage) {
  return await page.evaluate(() => {
    const getText = (sel: string) =>
      document.querySelector(sel)?.textContent?.trim() || null;
    const getMeta = (name: string) =>
      document
        .querySelector(`meta[name="${name}"], meta[property="${name}"]`)
        ?.getAttribute("content") || null;

    // Headings
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3")
    ).map((el) => ({
      level: parseInt(el.tagName[1]),
      text: el.textContent?.trim() || "",
    }));

    // CTAs erkennen (Buttons, Links mit typischen Texten)
    const ctaKeywords = /kontakt|anfrage|jetzt|kostenlos|termin|beratung|anrufen|schreiben|buchen|bestellen/i;
    const ctaTexts = Array.from(
      document.querySelectorAll("button, a, .btn, [class*='cta']")
    )
      .map((el) => el.textContent?.trim() || "")
      .filter((t) => t.length > 0 && t.length < 60 && ctaKeywords.test(t));

    // E-Mails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const bodyText = document.body.textContent || "";
    const emails = [...new Set(bodyText.match(emailRegex) || [])];

    // Telefon
    const phoneRegex = /(\+49|0)[0-9\s\-\/]{6,20}/g;
    const phones = [...new Set(bodyText.match(phoneRegex) || [])];

    // Adresse (grob)
    const hasAddress = /[0-9]{5}\s+[A-ZÄÖÜ][a-zäöü]+/.test(bodyText);

    // Wörter zählen
    const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 1).length;

    return {
      title: document.title || null,
      metaDescription: getMeta("description"),
      metaKeywords: getMeta("keywords"),
      h1: getText("h1"),
      headings,
      bodyText: bodyText.slice(0, 10000), // Limit
      hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
      hasCanonical: !!document.querySelector('link[rel="canonical"]'),
      hasCTA: ctaTexts.length > 0,
      ctaTexts,
      hasForm: document.querySelectorAll("form").length > 0,
      hasPhone: phones.length > 0,
      hasAddress,
      hasImages: document.querySelectorAll("img").length > 0,
      imageCount: document.querySelectorAll("img").length,
      contactEmails: emails,
      contactPhones: phones,
      wordCount,
    };
  });
}

// ─── Intern verlinkbare Seiten finden ─────────────────────────────────────────

async function findInternalLinks(
  page: PlaywrightPage,
  baseUrl: string
): Promise<string[]> {
  const baseDomain = extractDomain(baseUrl);
  const links = await page.evaluate((domain) => {
    return Array.from(document.querySelectorAll("a[href]"))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((href) => {
        try {
          const u = new URL(href);
          return (
            u.hostname.includes(domain) &&
            !href.includes("#") &&
            !href.match(/\.(pdf|jpg|png|gif|svg|zip|docx?|xlsx?)$/i)
          );
        } catch {
          return false;
        }
      });
  }, baseDomain);

  return [...new Set(links)];
}

// ─── Haupt-Crawl-Funktion ─────────────────────────────────────────────────────

export async function crawlWebsite(companyId: string): Promise<void> {
  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  const url = normalizeUrl(company.websiteUrl || `https://${company.domain}`);

  // Audit-Log: Crawl gestartet
  await logCrawlStarted(companyId);

  // Crawl-Record anlegen
  const crawl = await db.crawl.create({
    data: {
      companyId,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: process.env.PLAYWRIGHT_HEADLESS !== "false",
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent:
        "Mozilla/5.0 (compatible; WebsiteRescueAgent/1.0; +https://lucellostudio.de/bot)",
    });

    const browserPage = await context.newPage();

    // Startseite laden
    const startTime = Date.now();
    const response = await browserPage.goto(url, {
      timeout: TIMEOUT,
      waitUntil: "domcontentloaded",
    });
    const loadTimeMs = Date.now() - startTime;

    const httpStatus = response?.status() ?? 0;
    const finalUrl = browserPage.url();

    // Screenshot der Startseite
    const screenshotBuffer = await browserPage.screenshot({ fullPage: true });
    const screenshotUrl = await saveScreenshot(
      companyId,
      screenshotBuffer,
      "home"
    );

    // HTML-Snapshot
    const html = await browserPage.content();
    const htmlSnapshotUrl = await saveHtml(companyId, html, "home");

    // Startseiten-Daten
    const homeData = await extractPageData(browserPage);

    await db.page.create({
      data: {
        crawlId: crawl.id,
        url: finalUrl,
        pageType: "HOME",
        screenshotUrl,
        html,
        statusCode: httpStatus,
        loadTimeMs,
        title: homeData.title,
        metaDescription: homeData.metaDescription,
        metaKeywords: homeData.metaKeywords,
        h1: homeData.h1,
        headings: JSON.stringify(homeData.headings),
        bodyText: homeData.bodyText,
        hasViewportMeta: homeData.hasViewportMeta,
        hasCanonical: homeData.hasCanonical,
        hasCTA: homeData.hasCTA,
        ctaTexts: JSON.stringify(homeData.ctaTexts),
        hasForm: homeData.hasForm,
        hasPhone: homeData.hasPhone,
        hasAddress: homeData.hasAddress,
        hasImages: homeData.hasImages,
        imageCount: homeData.imageCount,
        contactEmails: JSON.stringify(homeData.contactEmails),
        contactPhones: JSON.stringify(homeData.contactPhones),
        wordCount: homeData.wordCount,
      },
    });

    // Interne Links finden
    const internalLinks = await findInternalLinks(browserPage, finalUrl);
    const toVisit = internalLinks
      .filter((l) => l !== finalUrl)
      .slice(0, MAX_PAGES - 1);

    let pageCount = 1;

    // Unterseiten crawlen
    for (const link of toVisit) {
      try {
        const subPage = await context.newPage();
        const subStart = Date.now();
        const subResponse = await subPage.goto(link, {
          timeout: TIMEOUT,
          waitUntil: "domcontentloaded",
        });
        const subLoadTime = Date.now() - subStart;
        const pageType = classifyPage(link);
        const subData = await extractPageData(subPage);

        let subScreenshotUrl: string | null = null;
        if (["SERVICES", "ABOUT", "CONTACT"].includes(pageType)) {
          const buf = await subPage.screenshot({ fullPage: true });
          subScreenshotUrl = await saveScreenshot(
            companyId,
            buf,
            pageType.toLowerCase()
          );
        }

        await db.page.create({
          data: {
            crawlId: crawl.id,
            url: link,
            pageType,
            screenshotUrl: subScreenshotUrl,
            statusCode: subResponse?.status() ?? 0,
            loadTimeMs: subLoadTime,
            title: subData.title,
            metaDescription: subData.metaDescription,
            metaKeywords: subData.metaKeywords,
            h1: subData.h1,
            headings: JSON.stringify(subData.headings),
            bodyText: subData.bodyText,
            hasViewportMeta: subData.hasViewportMeta,
            hasCanonical: subData.hasCanonical,
            hasCTA: subData.hasCTA,
            ctaTexts: JSON.stringify(subData.ctaTexts),
            hasForm: subData.hasForm,
            hasPhone: subData.hasPhone,
            hasAddress: subData.hasAddress,
            hasImages: subData.hasImages,
            imageCount: subData.imageCount,
            contactEmails: JSON.stringify(subData.contactEmails),
            contactPhones: JSON.stringify(subData.contactPhones),
            wordCount: subData.wordCount,
          },
        });

        await subPage.close();
        pageCount++;
      } catch {
        // Einzelne Seite schlägt fehl → weiter crawlen
      }
    }

    // Kontaktinfos aus allen Seiten sammeln und in Contact-DB speichern
    const allPages = await db.page.findMany({ where: { crawlId: crawl.id } });
    const emails = [
      ...new Set(
        allPages.flatMap((p) => (p.contactEmails as string[] | null) ?? [])
      ),
    ];

    for (const email of emails.slice(0, 3)) {
      await db.contact.upsert({
        where: { id: `${companyId}_${email}` },
        update: {},
        create: {
          id: `${companyId}_${email}`,
          companyId,
          email,
          source: "website",
        },
      });
    }

    // Crawl abschließen
    await db.crawl.update({
      where: { id: crawl.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        httpStatus,
        finalUrl,
        loadTimeMs,
        pageCount,
        screenshotUrl,
        htmlSnapshotUrl,
      },
    });

    await db.company.update({
      where: { id: companyId },
      data: { status: "CRAWLED" },
    });

    // Audit-Log: Crawl abgeschlossen
    await logCrawlCompleted(companyId, pageCount);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    
    // Audit-Log: Crawl fehlgeschlagen
    await logCrawlFailed(companyId, message);
    
    await db.crawl.update({
      where: { id: crawl.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: message,
        retryCount: { increment: 1 },
      },
    });
    throw error;
  } finally {
    await browser?.close();
  }
}
