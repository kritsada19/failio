import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter
})

async function main() {
    console.log("🌱 Start seeding...");

    // 1. สร้างหมวดหมู่ (Categories)
    const categories = [
        "Work",
        "Education",
        "Relationships",
        "Health",
        "Finance",
        "Self-Improvement",
    ];

    console.log("Creating categories...");
    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // 2. สร้างอารมณ์/ความรู้สึก (Emotions)
    const emotions = [
        "Sad",
        "Angry",
        "Confused",
        "Disappointed",
        "Anxious",
        "Guilty",
    ];

    console.log("Creating emotions...");
    for (const name of emotions) {
        await prisma.emotion.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    console.log("✅ Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
