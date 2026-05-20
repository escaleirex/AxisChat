import path from "path"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

function createAdapter() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db"
  const dbPath = path.join(
    process.cwd(),
    dbUrl.replace("file:", "").replace(/^\.\//, "")
  )
  return new PrismaBetterSqlite3({ url: dbPath })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: createAdapter() })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
