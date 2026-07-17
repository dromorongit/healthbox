import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

// Edit the values below, then run: npx ts-node scripts/createAdmin.ts
const fullName = "Supervisor Admin";
const email = "supervisor@healthbox.org";
const password = "password123";
const facility = "Main Hospital";

async function createAdmin(): Promise<void> {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const adminUser = await prisma.adminUser.create({
      data: {
        fullName,
        email,
        passwordHash,
        facility,
      },
    });

    console.log("Admin user created successfully:");
    console.log(`  ID: ${adminUser.id}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Full Name: ${adminUser.fullName}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      console.error("An admin user with this email already exists");
    } else {
      console.error("Failed to create admin:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();