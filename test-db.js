// Using ES Module import syntax
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Connection successful");

    // Perform a simple query - adjust according to your schema
    const rsvps = await prisma.rSVP.findMany();
    console.log(rsvps);
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
