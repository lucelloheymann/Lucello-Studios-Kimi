// Evaluate functions for Playwright - pure JS to avoid tsx/esbuild __name issues

function extractPageData() {
  const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
  const getMeta = (name) =>
    document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute("content") || null;

  const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map((el) => ({
    level: parseInt(el.tagName[1]),
    text: el.textContent?.trim() || "",
  }));

  const ctaKeywords = /kontakt|anfrage|jetzt|kostenlos|termin|beratung|anrufen|schreiben|buchen|bestellen/i;
  const ctaTexts = Array.from(document.querySelectorAll("button, a, .btn, [class*='cta']"))
    .map((el) => el.textContent?.trim() || "")
    .filter((t) => t.length > 0 && t.length < 60 && ctaKeywords.test(t));

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const bodyText = document.body.textContent || "";
  const emails = [...new Set(bodyText.match(emailRegex) || [])];

  const phoneRegex = /(\+49|0)[0-9\s\-\/]{6,20}/g;
  const phones = [...new Set(bodyText.match(phoneRegex) || [])];

  const hasAddress = /[0-9]{5}\s+[A-ZÄÖÜ][a-zäöü]+/.test(bodyText);
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 1).length;

  return {
    title: document.title || null,
    metaDescription: getMeta("description"),
    metaKeywords: getMeta("keywords"),
    h1: getText("h1"),
    headings,
    bodyText: bodyText.slice(0, 10000),
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
}

function findInternalLinks(domain) {
  return Array.from(document.querySelectorAll("a[href]"))
    .map((a) => a.href)
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
}

module.exports = { extractPageData, findInternalLinks };
