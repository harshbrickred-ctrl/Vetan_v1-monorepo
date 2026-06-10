-- CreateTable
CREATE TABLE "VisitorRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "visitToName" TEXT NOT NULL,
    "visitToEmployeeId" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL,
    "photoStoredFilename" TEXT,
    "photoMimeType" TEXT,
    "photoSizeBytes" INTEGER,
    "photoOriginalFilename" TEXT,
    "registeredByEmployeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitorRecord_tenantId_visitedAt_idx" ON "VisitorRecord"("tenantId", "visitedAt");

-- CreateIndex
CREATE INDEX "VisitorRecord_tenantId_visitToEmployeeId_idx" ON "VisitorRecord"("tenantId", "visitToEmployeeId");

-- AddForeignKey
ALTER TABLE "VisitorRecord" ADD CONSTRAINT "VisitorRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorRecord" ADD CONSTRAINT "VisitorRecord_visitToEmployeeId_fkey" FOREIGN KEY ("visitToEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorRecord" ADD CONSTRAINT "VisitorRecord_registeredByEmployeeId_fkey" FOREIGN KEY ("registeredByEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
