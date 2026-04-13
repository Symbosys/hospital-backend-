-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'NEXT', 'COMPLETED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "queueStatus" "QueueStatus" NOT NULL DEFAULT 'WAITING',
ADD COLUMN     "tokenNumber" INTEGER;
