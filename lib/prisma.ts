import { type Prisma, PrismaClient } from "@prisma/client";

let prisma: PrismaClient<Prisma.PrismaClientOptions, "query" | "info" | "warn" | "error">;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    if (process.env.DEBUG_MODE === "enabled") {
      globalWithPrisma.prisma = new PrismaClient({
        log: [
          {
            emit: "event",
            level: "query",
          },
          {
            emit: "stdout",
            level: "error",
          },
          {
            emit: "stdout",
            level: "info",
          },
          {
            emit: "stdout",
            level: "warn",
          },
        ],
      });
    } else {
      globalWithPrisma.prisma = new PrismaClient();
    }
  }

  prisma = globalWithPrisma.prisma;

  if (process.env.DEBUG_MODE === "enabled") {
    prisma.$on("query", (e) => {
      console.log("Query: " + e.query);
      console.log("Params: " + e.params);
      console.log("Duration: " + e.duration + "ms");
    });
  }
}

export default prisma as PrismaClient;
