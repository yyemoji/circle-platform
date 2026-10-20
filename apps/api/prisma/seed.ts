import { PrismaClient, RoleCode } from '@prisma/client';
import { buildSeedData } from './seed-data';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const seed = await buildSeedData();
  const permissions: Record<RoleCode, string[]> = {
    USER: ['profile:read', 'profile:write', 'content:read', 'order:write'],
    ANCHOR: ['live:write', 'content:write', 'appointment:manage'],
    REVIEWER: ['content:review', 'report:manage'],
    ADMIN: ['*'],
  };

  for (const code of Object.values(RoleCode)) {
    await prisma.role.upsert({ where: { code }, update: { permissions: permissions[code] }, create: { code, name: code, permissions: permissions[code] } });
  }

  for (const item of seed.users) {
    const user = await prisma.user.upsert({
      where: { username: item.username },
      update: { displayName: item.displayName, passwordHash: item.passwordHash },
      create: { username: item.username, displayName: item.displayName, passwordHash: item.passwordHash },
    });
    for (const code of item.roles) {
      const role = await prisma.role.findUniqueOrThrow({ where: { code } });
      await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
    }
    await prisma.wallet.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, balance: item.walletBalance } });
  }

  for (const item of seed.circles) {
    const owner = await prisma.user.findUniqueOrThrow({ where: { username: item.ownerUsername } });
    const data = { name: item.name, description: item.description, entryCoins: item.entryCoins, ownerId: owner.id };
    await prisma.circle.upsert({ where: { slug: item.slug }, update: data, create: { slug: item.slug, ...data } });
  }
  for (const item of seed.posts) {
    const existing = await prisma.post.findFirst({ where: { title: item.title } });
    if (!existing) {
      const author = await prisma.user.findUniqueOrThrow({ where: { username: item.authorUsername } });
      const circle = await prisma.circle.findUniqueOrThrow({ where: { slug: item.circleSlug } });
      await prisma.post.create({ data: { title: item.title, body: item.body, status: 'APPROVED', authorId: author.id, circleId: circle.id } });
    }
  }
  for (const item of seed.liveRooms) {
    const anchor = await prisma.user.findUniqueOrThrow({ where: { username: item.anchorUsername } });
    const data = { title: item.title, viewerCoins: item.viewerCoins, secondViewCoins: item.secondViewCoins, anchorId: anchor.id };
    await prisma.liveRoom.upsert({ where: { streamKey: item.streamKey }, update: data, create: { streamKey: item.streamKey, ...data } });
  }
}

main().finally(async () => prisma.$disconnect());
