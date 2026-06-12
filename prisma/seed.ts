import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { name: string; crest: string };
  awayTeam: { name: string; crest: string };
}

const seed = async () => {
  console.log("🌱 Bắt đầu seed...");

  // 1. Tạo admin account
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: { passwordHash, isAdmin: true },
    create: {
      username: adminUsername,
      passwordHash,
      isAdmin: true,
    },
  });

  console.log(`✅ Admin account: ${admin.username}`);

  // 2. Import trận từ football-data.org
  console.log("⚽ Đang lấy lịch thi đấu World Cup 2026...");

  const response = await fetch(`${API_BASE}/competitions/WC/matches`, {
    headers: { "X-Auth-Token": API_KEY },
  });

  if (!response.ok) {
    console.error(`❌ API error: ${response.status} ${response.statusText}`);
    console.log("⚠️  Bỏ qua import trận. Bạn có thể chạy lại seed sau.");
    await prisma.$disconnect();
    return;
  }

  const data = await response.json();
  const matches: ApiMatch[] = data.matches;

  console.log(`📋 Tìm thấy ${matches.length} trận`);

  let created = 0;
  let skipped = 0;

  for (const match of matches) {
    const existing = await prisma.match.findUnique({
      where: { externalId: match.id },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Skip trận chưa xác định đội (vòng knock-out chưa biết đội nào)
    if (!match.homeTeam.name || !match.awayTeam.name) {
      skipped++;
      continue;
    }

    // World Cup vòng knockout không cho phép hòa (phải có winner)
    const knockoutStages = ["LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"];
    const allowDraw = !knockoutStages.includes(match.stage);

    await prisma.match.create({
      data: {
        teamA: match.homeTeam.name,
        teamB: match.awayTeam.name,
        teamACrest: match.homeTeam.crest,
        teamBCrest: match.awayTeam.crest,
        kickoffTime: new Date(match.utcDate),
        allowDraw,
        externalId: match.id,
        stage: match.stage,
        group: match.group,
      },
    });

    created++;
  }

  console.log(`✅ Import xong: ${created} trận mới, ${skipped} trận đã tồn tại`);
  console.log("🎉 Seed hoàn tất!");

  await prisma.$disconnect();
};

seed().catch((error) => {
  console.error("❌ Seed thất bại:", error);
  prisma.$disconnect();
  process.exit(1);
});
