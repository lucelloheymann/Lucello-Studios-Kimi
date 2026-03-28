-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "industry" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "linkedinUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "buyingProbability" REAL,
    "opportunityScore" REAL,
    "searchSource" TEXT,
    "searchConfigId" TEXT,
    "searchQuery" TEXT,
    "searchRegion" TEXT,
    "isQualified" BOOLEAN,
    "qualificationReason" TEXT,
    "disqualifiedReason" TEXT,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "isContacted" BOOLEAN NOT NULL DEFAULT false,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOfId" TEXT,
    "notes" TEXT,
    "nextActionAt" DATETIME,
    "nextActionNote" TEXT,
    "ownerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Company_searchConfigId_fkey" FOREIGN KEY ("searchConfigId") REFERENCES "SearchConfiguration" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "source" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Crawl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "httpStatus" INTEGER,
    "redirectUrl" TEXT,
    "finalUrl" TEXT,
    "loadTimeMs" INTEGER,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "screenshotUrl" TEXT,
    "htmlSnapshotUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Crawl_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crawlId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'OTHER',
    "title" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "h1" TEXT,
    "headings" TEXT,
    "bodyText" TEXT,
    "html" TEXT,
    "screenshotUrl" TEXT,
    "hasViewportMeta" BOOLEAN NOT NULL DEFAULT false,
    "hasCanonical" BOOLEAN NOT NULL DEFAULT false,
    "hasContactInfo" BOOLEAN NOT NULL DEFAULT false,
    "hasCTA" BOOLEAN NOT NULL DEFAULT false,
    "hasForm" BOOLEAN NOT NULL DEFAULT false,
    "hasPhone" BOOLEAN NOT NULL DEFAULT false,
    "hasAddress" BOOLEAN NOT NULL DEFAULT false,
    "hasImages" BOOLEAN NOT NULL DEFAULT false,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "ctaTexts" TEXT,
    "contactEmails" TEXT,
    "contactPhones" TEXT,
    "statusCode" INTEGER,
    "loadTimeMs" INTEGER,
    "wordCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Page_crawlId_fkey" FOREIGN KEY ("crawlId") REFERENCES "Crawl" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "crawlId" TEXT,
    "overallScore" REAL,
    "confidence" REAL,
    "designScore" REAL,
    "clarityScore" REAL,
    "conversionScore" REAL,
    "trustScore" REAL,
    "uxScore" REAL,
    "mobileScore" REAL,
    "seoScore" REAL,
    "performanceScore" REAL,
    "modernityScore" REAL,
    "scoreReasons" TEXT,
    "executiveSummary" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "quickWins" TEXT,
    "opportunities" TEXT,
    "findings" TEXT,
    "isQualified" BOOLEAN,
    "qualificationReason" TEXT,
    "opportunityScore" REAL,
    "buyingProbability" REAL,
    "heuristicVersion" TEXT,
    "llmModel" TEXT,
    "llmPromptVersion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitorSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT,
    "screenshotUrl" TEXT,
    "overallScore" REAL,
    "scores" TEXT,
    "summary" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompetitorSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedSite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "style" TEXT NOT NULL DEFAULT 'MODERN_PREMIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "htmlContent" TEXT,
    "cssContent" TEXT,
    "sections" TEXT,
    "hasPlaceholders" BOOLEAN NOT NULL DEFAULT false,
    "placeholderNotes" TEXT,
    "unverifiedClaims" TEXT,
    "generatedBy" TEXT,
    "promptVersion" TEXT,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "previewUrl" TEXT,
    "screenshotUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneratedSite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutreachDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'EMAIL_SHORT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "subject" TEXT,
    "body" TEXT,
    "generatedSiteId" TEXT,
    "offerId" TEXT,
    "redFlags" TEXT,
    "hasUnreviewedPlaceholders" BOOLEAN NOT NULL DEFAULT false,
    "isBlockedForSend" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "sentAt" DATETIME,
    "sentBy" TEXT,
    "openedAt" DATETIME,
    "repliedAt" DATETIME,
    "llmModel" TEXT,
    "promptVersion" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutreachDraft_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PipelineState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedBy" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PipelineState_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUpTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" DATETIME,
    "completedAt" DATETIME,
    "type" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FollowUpTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "userId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Artifact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'NATIONWIDE',
    "country" TEXT NOT NULL DEFAULT 'DE',
    "states" TEXT,
    "cities" TEXT,
    "postalCodes" TEXT,
    "radiusKm" INTEGER,
    "centerCity" TEXT,
    "centerLat" REAL,
    "centerLng" REAL,
    "industries" TEXT,
    "excludeLargeCorps" BOOLEAN NOT NULL DEFAULT true,
    "excludeGovt" BOOLEAN NOT NULL DEFAULT true,
    "minEmployees" INTEGER,
    "maxEmployees" INTEGER DEFAULT 500,
    "excludeKeywords" TEXT,
    "maxLeadsPerRun" INTEGER DEFAULT 50,
    "dailyLimit" INTEGER DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IndustryTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "industry" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "keySections" TEXT,
    "commonWeaknesses" TEXT,
    "strongCtaTypes" TEXT,
    "headlinePatterns" TEXT,
    "trustElements" TEXT,
    "styleDirection" TEXT,
    "offerLogic" TEXT,
    "seoKeywords" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OfferTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "description" TEXT,
    "tagline" TEXT,
    "scope" TEXT,
    "benefits" TEXT,
    "features" TEXT,
    "deliverables" TEXT,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "durationDays" INTEGER,
    "suitableIndustries" TEXT,
    "suitableForScore" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OutreachTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "industry" TEXT,
    "description" TEXT,
    "subjectTemplate" TEXT,
    "bodyTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JobRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "entityType" TEXT,
    "entityId" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "payload" TEXT,
    "result" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT,
    "queueJobId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_domain_key" ON "Company"("domain");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Company_state_idx" ON "Company"("state");

-- CreateIndex
CREATE INDEX "Company_priority_idx" ON "Company"("priority");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Crawl_companyId_idx" ON "Crawl"("companyId");

-- CreateIndex
CREATE INDEX "Crawl_status_idx" ON "Crawl"("status");

-- CreateIndex
CREATE INDEX "Page_crawlId_idx" ON "Page"("crawlId");

-- CreateIndex
CREATE INDEX "Page_pageType_idx" ON "Page"("pageType");

-- CreateIndex
CREATE INDEX "Analysis_companyId_idx" ON "Analysis"("companyId");

-- CreateIndex
CREATE INDEX "Analysis_status_idx" ON "Analysis"("status");

-- CreateIndex
CREATE INDEX "Analysis_overallScore_idx" ON "Analysis"("overallScore");

-- CreateIndex
CREATE INDEX "CompetitorSnapshot_companyId_idx" ON "CompetitorSnapshot"("companyId");

-- CreateIndex
CREATE INDEX "GeneratedSite_companyId_idx" ON "GeneratedSite"("companyId");

-- CreateIndex
CREATE INDEX "GeneratedSite_status_idx" ON "GeneratedSite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedSite_companyId_version_style_key" ON "GeneratedSite"("companyId", "version", "style");

-- CreateIndex
CREATE INDEX "OutreachDraft_companyId_idx" ON "OutreachDraft"("companyId");

-- CreateIndex
CREATE INDEX "OutreachDraft_status_idx" ON "OutreachDraft"("status");

-- CreateIndex
CREATE INDEX "PipelineState_companyId_idx" ON "PipelineState"("companyId");

-- CreateIndex
CREATE INDEX "PipelineState_createdAt_idx" ON "PipelineState"("createdAt");

-- CreateIndex
CREATE INDEX "FollowUpTask_companyId_idx" ON "FollowUpTask"("companyId");

-- CreateIndex
CREATE INDEX "FollowUpTask_dueAt_idx" ON "FollowUpTask"("dueAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Artifact_companyId_idx" ON "Artifact"("companyId");

-- CreateIndex
CREATE INDEX "Artifact_type_idx" ON "Artifact"("type");

-- CreateIndex
CREATE INDEX "SearchConfiguration_isActive_idx" ON "SearchConfiguration"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTemplate_industry_key" ON "IndustryTemplate"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "JobRecord_idempotencyKey_key" ON "JobRecord"("idempotencyKey");

-- CreateIndex
CREATE INDEX "JobRecord_type_status_idx" ON "JobRecord"("type", "status");

-- CreateIndex
CREATE INDEX "JobRecord_entityId_idx" ON "JobRecord"("entityId");

-- CreateIndex
CREATE INDEX "JobRecord_createdAt_idx" ON "JobRecord"("createdAt");
