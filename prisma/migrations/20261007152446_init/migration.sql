-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "walletAddress" TEXT,
    "profileHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneEncrypted" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriticalData" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergiesEncrypted" TEXT NOT NULL,
    "conditionsEncrypted" TEXT NOT NULL,
    "medsEncrypted" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "notesEncrypted" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CriticalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakGlassLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "locationRough" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "notifyStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreakGlassLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRToken" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_phoneHash_key" ON "Patient"("phoneHash");

-- CreateIndex
CREATE INDEX "Patient_phoneHash_idx" ON "Patient"("phoneHash");

-- CreateIndex
CREATE INDEX "EmergencyContact_patientId_idx" ON "EmergencyContact"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "CriticalData_patientId_key" ON "CriticalData"("patientId");

-- CreateIndex
CREATE INDEX "BreakGlassLog_patientId_idx" ON "BreakGlassLog"("patientId");

-- CreateIndex
CREATE INDEX "BreakGlassLog_createdAt_idx" ON "BreakGlassLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QRToken_patientId_key" ON "QRToken"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "QRToken_token_key" ON "QRToken"("token");

-- CreateIndex
CREATE INDEX "QRToken_token_idx" ON "QRToken"("token");

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriticalData" ADD CONSTRAINT "CriticalData_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakGlassLog" ADD CONSTRAINT "BreakGlassLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRToken" ADD CONSTRAINT "QRToken_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
