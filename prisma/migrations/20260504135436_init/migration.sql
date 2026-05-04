-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "stolenObject" TEXT NOT NULL,
    "victimGender" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "exactDate" TIMESTAMP(3),
    "approximateDate" TEXT,
    "timeOfDay" TEXT NOT NULL,
    "description" TEXT,
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);
