CREATE TABLE "AiDraft" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "location" TEXT,
    "country" TEXT,
    "deadline" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "applyLink" TEXT,
    "content" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiDraft_pkey" PRIMARY KEY ("id")
);