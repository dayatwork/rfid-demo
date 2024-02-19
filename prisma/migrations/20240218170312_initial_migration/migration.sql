-- CreateTable
CREATE TABLE "RfidReader" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "DeviceLocation" (
    "deviceId" TEXT NOT NULL,
    "rfidReaderId" TEXT NOT NULL,
    "dateTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeviceLocation_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeviceLocation_rfidReaderId_fkey" FOREIGN KEY ("rfidReaderId") REFERENCES "RfidReader" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_tagId_key" ON "Device"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceLocation_deviceId_key" ON "DeviceLocation"("deviceId");
