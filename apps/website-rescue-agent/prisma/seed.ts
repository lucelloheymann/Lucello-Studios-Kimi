// Seed-Daten für Website Rescue Agent (SQLite-kompatibel)
// Erstellt realistische Demo-Leads für alle Pipeline-Phasen

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// LeadStatus als String-Typen für SQLite
const SAMPLE_LEADS = [
  {
    name: "Schreinerei Wagner GmbH",
    domain: "schreinerei-wagner.de",
    industry: "handwerk",
    city: "München",
    state: "DE-BY",
    status: "QUALIFIED",
    score: 28,
    weaknesses: ["Keine Mobile-Optimierung", "Kein CTA auf der Startseite", "Ladezeit über 8 Sekunden", "Kein Kontaktformular"],
    strengths: ["Impressum vorhanden", "Gute Bilder"],
  },
  {
    name: "Immobilien Braun & Partner",
    domain: "braun-immobilien-hh.de",
    industry: "immobilien",
    city: "Hamburg",
    state: "DE-HH",
    status: "SITE_GENERATED",
    score: 35,
    weaknesses: ["Veraltetes Design (ca. 2015)", "Keine klare Value Proposition", "Fehlende Bewertungen / Social Proof"],
    strengths: ["Telefonnummer sichtbar", "Leistungsseite vorhanden"],
  },
  {
    name: "Kanzlei Hoffmann & Richter",
    domain: "kanzlei-hoffmann-richter.de",
    industry: "kanzlei",
    city: "Köln",
    state: "DE-NW",
    status: "OUTREACH_DRAFT_READY",
    score: 22,
    weaknesses: ["Keine Meta-Descriptions", "Kein H1 auf der Startseite", "Schwache Conversion", "Keine Über-uns-Seite"],
    strengths: ["Domain professionell"],
  },
  {
    name: "Zahnarztpraxis Dr. Müller",
    domain: "zahnarzt-mueller-berlin.de",
    industry: "arztpraxis",
    city: "Berlin",
    state: "DE-BE",
    status: "ANALYZED",
    score: 42,
    weaknesses: ["Kein Online-Terminbuchung", "Schwaches Design", "Keine Patientenbewertungen"],
    strengths: ["Kontaktdaten sichtbar", "Öffnungszeiten vorhanden", "Mobile-Viewport gesetzt"],
  },
  {
    name: "Elektro Steinmetz",
    domain: "elektro-steinmetz-dortmund.de",
    industry: "handwerk",
    city: "Dortmund",
    state: "DE-NW",
    status: "CRAWLED",
    score: 19,
    weaknesses: ["Website lädt sehr langsam", "Kein SSL (HTTP)", "Keine CTAs", "Uraltes Flash-Layout"],
    strengths: ["Telefonnummer gefunden"],
  },
  {
    name: "Steuerberater Frank Lehmann",
    domain: "stb-lehmann-frankfurt.de",
    industry: "berater",
    city: "Frankfurt am Main",
    state: "DE-HE",
    status: "QUALIFIED",
    score: 31,
    weaknesses: ["Keine Mobile-Version", "Generische Texte ohne Differenzierung", "Kein klarer Leistungsbereich"],
    strengths: ["Impressum vollständig"],
  },
  {
    name: "Fitness Center Nordlicht",
    domain: "fitness-nordlicht.de",
    industry: "fitness",
    city: "Hamburg",
    state: "DE-HH",
    status: "NEW",
    score: null,
    weaknesses: [],
    strengths: [],
  },
  {
    name: "Malerbetrieb Özdemir",
    domain: "maler-oezdemir-stuttgart.de",
    industry: "handwerk",
    city: "Stuttgart",
    state: "DE-BW",
    status: "IN_REVIEW",
    score: 26,
    weaknesses: ["Keine Unterseiten", "Nur eine Seite", "Keine Referenzprojekte"],
    strengths: ["Lokale Keywords vorhanden"],
  },
  {
    name: "Physiotherapie am Markt",
    domain: "physio-am-markt.de",
    industry: "arztpraxis",
    city: "Nürnberg",
    state: "DE-BY",
    status: "SENT",
    score: 33,
    weaknesses: ["Keine Online-Terminbuchung", "Schlechte Navigation"],
    strengths: ["Team-Fotos vorhanden"],
  },
  {
    name: "Küchen-Design Klein",
    domain: "kuechen-klein.de",
    industry: "handwerk",
    city: "Düsseldorf",
    state: "DE-NW",
    status: "WON",
    score: 24,
    weaknesses: ["Komplett veraltete Website", "Keine Bildergalerie", "Kein Kontaktformular"],
    strengths: ["Adresse sichtbar"],
  },
];

async function main() {
  console.log("Seed-Daten werden erstellt...");

  // Industry-Templates (JSON als String für SQLite)
  await db.industryTemplate.upsert({
    where: { industry: "handwerk" },
    update: {},
    create: {
      industry: "handwerk",
      displayName: "Handwerk",
      description: "Schreinerei, Elektro, Maler, Sanitär, usw.",
      keySections: JSON.stringify(["hero", "services", "about", "trust", "process", "contact"]),
      commonWeaknesses: JSON.stringify([
        "Keine Mobile-Optimierung",
        "Veraltetes Design",
        "Fehlende Referenzprojekte",
        "Kein Online-Anfrage-Formular",
        "Schwache Ladezeit",
      ]),
      strongCtaTypes: JSON.stringify(["Angebot anfordern", "Rückruf vereinbaren", "Kostenlose Besichtigung"]),
      headlinePatterns: JSON.stringify([
        "{BERUF} in {ORT} — Qualität die überzeugt",
        "Ihr Meisterbetrieb in {ORT}",
        "{BERUF} mit {JAHRE} Jahren Erfahrung",
      ]),
      trustElements: JSON.stringify(["Meisterbetrieb", "lokale Referenzen", "Kundenbewertungen", "Zertifizierungen"]),
      styleDirection: "lokal, vertrauenswürdig, professionell",
    },
  });

  await db.industryTemplate.upsert({
    where: { industry: "immobilien" },
    update: {},
    create: {
      industry: "immobilien",
      displayName: "Immobilienmakler",
      keySections: JSON.stringify(["hero", "services", "about", "references", "trust", "process", "contact"]),
      commonWeaknesses: JSON.stringify([
        "Veraltetes Design ohne aktuelle Listings",
        "Keine klare Erfolgsbilanz sichtbar",
        "Schwache Lead-Generierung",
      ]),
      strongCtaTypes: JSON.stringify(["Kostenlose Immobilienbewertung", "Beratungstermin vereinbaren"]),
      trustElements: JSON.stringify(["Verkaufte Objekte", "Kundenbewertungen", "lokale Marktkenntnis"]),
      styleDirection: "premium, vertrauenswürdig, lokal verankert",
    },
  });

  // Offer-Templates (JSON als String für SQLite)
  const offerTemplates = [
      {
        name: "Landingpage Refresh",
        tier: "SMALL",
        tagline: "Mehr Anfragen mit einer klaren, modernen Startseite",
        description: "Modernisierung der Startseite mit klarer Value Proposition und starkem CTA",
        scope: "Optimierung der bestehenden Startseite: Headline, Struktur, CTA, Mobile-Check",
        benefits: JSON.stringify(["Mehr Anfragen", "Bessere mobile Darstellung", "Klare Botschaft"]),
        features: JSON.stringify([
          { label: "Startseiten-Optimierung", included: true },
          { label: "Mobile-Optimierung", included: true },
          { label: "CTA-Optimierung", included: true },
          { label: "Neue Unterseiten", included: false },
        ]),
        priceMin: 990,
        priceMax: 1490,
        durationDays: 7,
        suitableIndustries: JSON.stringify(["handwerk", "dienstleister", "fitness"]),
      },
      {
        name: "Startseiten-Relaunch",
        tier: "MEDIUM",
        tagline: "Kompletter Neustart mit professionellem Ergebnis",
        description: "Neue, professionelle Website mit allen wichtigen Seiten und starker Conversion-Ausrichtung",
        scope: "Startseite, Leistungsseiten, Über uns, Kontakt — komplett neu",
        benefits: JSON.stringify(["Professioneller Auftritt", "Mehr Vertrauen", "Mehr Anfragen", "SEO-Basis"]),
        features: JSON.stringify([
          { label: "Startseite (komplett neu)", included: true },
          { label: "Bis zu 5 Unterseiten", included: true },
          { label: "Mobile-First", included: true },
          { label: "Kontaktformular", included: true },
          { label: "SEO-Grundlage", included: true },
        ]),
        priceMin: 2490,
        priceMax: 3990,
        durationDays: 21,
        suitableIndustries: JSON.stringify(["handwerk", "immobilien", "arztpraxis", "berater", "kanzlei"]),
      },
      {
        name: "Premium Web-Auftritt",
        tier: "PREMIUM",
        tagline: "Ihr digitales Aushängeschild — conversion-optimiert",
        description: "Kompakter professioneller Web-Auftritt mit Strategie, Design und Conversion-Fokus",
        scope: "Vollständige neue Website mit Content-Strategie, Conversion-Optimierung, Ads-Readiness",
        benefits: JSON.stringify(["Premium-Design", "Mehr qualifizierte Leads", "Ads-ready", "Langfristige Grundlage"]),
        features: JSON.stringify([
          { label: "Bis zu 10 Seiten", included: true },
          { label: "Content-Strategie", included: true },
          { label: "Conversion-Optimierung", included: true },
          { label: "Ads-Landing-Page", included: true },
          { label: "3 Monate Support", included: true },
        ]),
        priceMin: 4990,
        priceMax: 8490,
        durationDays: 45,
        suitableIndustries: JSON.stringify(["immobilien", "kanzlei", "arztpraxis", "berater", "agentur"]),
      },
    ];
  
  for (const template of offerTemplates) {
    await db.offerTemplate.upsert({
      where: { id: template.name },
      update: {},
      create: template as any,
    });
  }

  // Outreach-Templates
  const outreachTemplates = [
      {
        name: "Kurzer Erstkontakt — Handwerk",
        type: "EMAIL_SHORT",
        industry: "handwerk",
        subjectTemplate: "Kurze Anmerkung zu {{company_name}}.de",
        bodyTemplate: `Guten Tag,

ich bin auf {{company_name}} in {{city}} aufmerksam geworden und wollte kurz Bescheid geben, dass ich auf Ihrer Website ein paar Dinge gesehen habe, bei denen ich konkret helfen kann.

Konkret: {{weakness_1}} und {{weakness_2}}.

Ich habe dazu eine kurze Demo erstellt — {{demo_url}} — damit Sie sehen können, wie das aussehen könnte.

Wenn das interessant klingt, freue ich mich über eine kurze Rückmeldung.

Mit freundlichen Grüßen
{{sender_name}}
Lucello Studio`,
      },
      {
        name: "Kurzer Erstkontakt — Immobilien",
        type: "EMAIL_SHORT",
        industry: "immobilien",
        subjectTemplate: "Mehr Anfragen über {{company_name}}.de",
        bodyTemplate: `Guten Tag,

ich habe mir {{company_name}}.de angeschaut und sehe direktes Potenzial für mehr Anfragen — besonders bei {{weakness_1}}.

Ich habe eine Demo-Version erstellt: {{demo_url}}

Interesse an einem kurzen Austausch?

{{sender_name}}, Lucello Studio`,
      },
      {
        name: "Follow-up",
        type: "FOLLOW_UP",
        industry: null,
        subjectTemplate: "Nochmal kurz: {{company_name}}.de",
        bodyTemplate: `Guten Tag,

ich hatte Ihnen vor einigen Tagen geschrieben bezüglich Ihrer Website.

Falls es bisher untergegangen ist — kein Problem. Ich wollte nur kurz nachhaken, ob das Thema vielleicht für Sie relevant sein könnte.

{{demo_url}}

Wenn kein Interesse: eine kurze Antwort genügt, dann melde ich mich nicht mehr.

{{sender_name}}`,
      },
    ];
  
  for (const template of outreachTemplates) {
    await db.outreachTemplate.upsert({
      where: { id: template.name },
      update: {},
      create: template as any,
    });
  }

  // Suchkonfiguration
  await db.searchConfiguration.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Deutschland — Handwerk & Dienstleister",
      isActive: true,
      scope: "NATIONWIDE",
      country: "DE",
      industries: JSON.stringify(["handwerk", "dienstleister", "arztpraxis"]),
      excludeLargeCorps: true,
      excludeGovt: true,
      maxEmployees: 200,
      maxLeadsPerRun: 50,
    },
  });

  // Sample-Leads erstellen
  for (const lead of SAMPLE_LEADS) {
    const company = await db.company.upsert({
      where: { domain: lead.domain },
      update: {},
      create: {
        name: lead.name,
        domain: lead.domain,
        websiteUrl: `https://${lead.domain}`,
        industry: lead.industry,
        city: lead.city,
        state: lead.state,
        country: "DE",
        status: lead.status,
        isQualified: lead.score !== null && lead.score < 55,
        opportunityScore: lead.score !== null ? Math.max(0, 100 - lead.score) * 0.85 : null,
        buyingProbability: lead.score !== null ? Math.min(0.9, (100 - lead.score) / 100 * 0.8) : null,
        priority: lead.score !== null ? Math.round((100 - lead.score) * 0.85) : 50,
        searchSource: "demo",
      },
    });

    // Analyse erstellen (wenn Score vorhanden)
    if (lead.score !== null) {
      const existingAnalysis = await db.analysis.findFirst({ where: { companyId: company.id } });
      if (!existingAnalysis) {
        await db.analysis.create({
          data: {
            companyId: company.id,
            status: "COMPLETED",
            overallScore: lead.score,
            confidence: 0.8,
            designScore: lead.score - 5 + Math.random() * 10,
            clarityScore: lead.score - 10 + Math.random() * 15,
            conversionScore: lead.score - 15 + Math.random() * 10,
            trustScore: lead.score + Math.random() * 10,
            uxScore: lead.score - 5 + Math.random() * 10,
            mobileScore: lead.score - 10,
            seoScore: lead.score - 5 + Math.random() * 5,
            performanceScore: lead.score + Math.random() * 15,
            modernityScore: lead.score - 20,
            executiveSummary: `${lead.name} hat einen Website-Score von ${lead.score}/100. ${lead.weaknesses.length > 0 ? `Hauptprobleme: ${lead.weaknesses.slice(0, 2).join(", ")}.` : ""} Klares Optimierungspotenzial vorhanden.`,
            strengths: JSON.stringify(lead.strengths),
            weaknesses: JSON.stringify(lead.weaknesses),
            quickWins: JSON.stringify(lead.weaknesses.slice(0, 2).map((w) => `Sofortmaßnahme: ${w} beheben`)),
            isQualified: lead.score < 55,
            qualificationReason: lead.score < 55 ? "Score unter 55, deutliches Verbesserungspotenzial" : "Score zu hoch für Relaunch-Pitch",
            opportunityScore: Math.max(0, 100 - lead.score) * 0.85,
            buyingProbability: Math.min(0.9, (100 - lead.score) / 100 * 0.8),
            heuristicVersion: "1.0",
            llmModel: "seed-data",
          },
        });
      }
    }

    // Pipeline-State
    await db.pipelineState.create({
      data: {
        companyId: company.id,
        toStatus: lead.status,
        reason: "Demo-Daten",
      },
    });
  }

  console.log(`✓ ${SAMPLE_LEADS.length} Demo-Leads erstellt`);
  console.log("✓ Industry-Templates erstellt");
  console.log("✓ Offer-Templates erstellt");
  console.log("✓ Outreach-Templates erstellt");
  console.log("✓ Suchkonfiguration erstellt");
  console.log("\nSeed erfolgreich abgeschlossen.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
