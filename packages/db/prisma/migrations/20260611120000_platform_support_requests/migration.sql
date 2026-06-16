-- CreateTable
CREATE TABLE "PlatformSupportRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "requesterRole" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "employeeId" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformSupportRequest_tenantId_createdAt_idx" ON "PlatformSupportRequest"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformSupportRequest_status_createdAt_idx" ON "PlatformSupportRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "PlatformSupportRequest" ADD CONSTRAINT "PlatformSupportRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
