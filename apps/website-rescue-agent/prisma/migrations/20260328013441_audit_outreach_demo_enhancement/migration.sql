/*
  Warnings:

  - Added the required column `eventType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT,
    "eventType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "userId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "severity" TEXT,
    "errorCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "companyId", "createdAt", "entityId", "entityType", "id", "metadata", "userId") SELECT "action", "companyId", "createdAt", "entityId", "entityType", "id", "metadata", "userId" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");
CREATE INDEX "AuditLog_eventType_idx" ON "AuditLog"("eventType");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE TABLE "new_GeneratedSite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "variant" TEXT NOT NULL DEFAULT 'A',
    "style" TEXT NOT NULL DEFAULT 'MODERN_PREMIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "headline" TEXT,
    "keyBenefits" TEXT,
    "htmlContent" TEXT,
    "cssContent" TEXT,
    "sections" TEXT,
    "hasPlaceholders" BOOLEAN NOT NULL DEFAULT false,
    "placeholderCount" INTEGER NOT NULL DEFAULT 0,
    "placeholderNotes" TEXT,
    "unverifiedClaims" TEXT,
    "errorCode" TEXT,
    "errorDetails" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "isRegeneration" BOOLEAN NOT NULL DEFAULT false,
    "previousVersionId" TEXT,
    "regenerationReason" TEXT,
    "generatedBy" TEXT,
    "promptVersion" TEXT,
    "generationTimeMs" INTEGER,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "reviewRating" INTEGER,
    "previewUrl" TEXT,
    "screenshotUrl" TEXT,
    "thumbnailUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneratedSite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GeneratedSite" ("companyId", "createdAt", "cssContent", "generatedBy", "hasPlaceholders", "htmlContent", "id", "placeholderNotes", "previewUrl", "promptVersion", "reviewNotes", "reviewedAt", "reviewedBy", "screenshotUrl", "sections", "status", "style", "unverifiedClaims", "updatedAt", "version") SELECT "companyId", "createdAt", "cssContent", "generatedBy", "hasPlaceholders", "htmlContent", "id", "placeholderNotes", "previewUrl", "promptVersion", "reviewNotes", "reviewedAt", "reviewedBy", "screenshotUrl", "sections", "status", "style", "unverifiedClaims", "updatedAt", "version" FROM "GeneratedSite";
DROP TABLE "GeneratedSite";
ALTER TABLE "new_GeneratedSite" RENAME TO "GeneratedSite";
CREATE INDEX "GeneratedSite_companyId_idx" ON "GeneratedSite"("companyId");
CREATE INDEX "GeneratedSite_status_idx" ON "GeneratedSite"("status");
CREATE INDEX "GeneratedSite_createdAt_idx" ON "GeneratedSite"("createdAt");
CREATE UNIQUE INDEX "GeneratedSite_companyId_version_variant_key" ON "GeneratedSite"("companyId", "version", "variant");
CREATE TABLE "new_OutreachDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'EMAIL_SHORT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "recipientRole" TEXT,
    "subject" TEXT,
    "body" TEXT,
    "offerTier" TEXT,
    "offerPriceRange" TEXT,
    "offerValidUntil" DATETIME,
    "generatedSiteId" TEXT,
    "offerId" TEXT,
    "redFlags" TEXT,
    "hasUnreviewedPlaceholders" BOOLEAN NOT NULL DEFAULT false,
    "isBlockedForSend" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "approvalNotes" TEXT,
    "rejectedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "sentAt" DATETIME,
    "sentBy" TEXT,
    "openedAt" DATETIME,
    "repliedAt" DATETIME,
    "lastEditedAt" DATETIME,
    "lastEditedBy" TEXT,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "editHistory" TEXT,
    "llmModel" TEXT,
    "promptVersion" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutreachDraft_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OutreachDraft" ("approvedAt", "approvedBy", "blockReason", "body", "companyId", "contactId", "createdAt", "errorMessage", "generatedSiteId", "hasUnreviewedPlaceholders", "id", "isBlockedForSend", "llmModel", "offerId", "openedAt", "promptVersion", "redFlags", "repliedAt", "sentAt", "sentBy", "status", "subject", "type", "updatedAt", "version") SELECT "approvedAt", "approvedBy", "blockReason", "body", "companyId", "contactId", "createdAt", "errorMessage", "generatedSiteId", "hasUnreviewedPlaceholders", "id", "isBlockedForSend", "llmModel", "offerId", "openedAt", "promptVersion", "redFlags", "repliedAt", "sentAt", "sentBy", "status", "subject", "type", "updatedAt", "version" FROM "OutreachDraft";
DROP TABLE "OutreachDraft";
ALTER TABLE "new_OutreachDraft" RENAME TO "OutreachDraft";
CREATE INDEX "OutreachDraft_companyId_idx" ON "OutreachDraft"("companyId");
CREATE INDEX "OutreachDraft_status_idx" ON "OutreachDraft"("status");
CREATE INDEX "OutreachDraft_createdAt_idx" ON "OutreachDraft"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
