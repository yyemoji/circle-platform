import { hash } from '@node-rs/argon2';

export interface SeedUser {
  username: string;
  displayName: string;
  plaintextPassword: string;
  passwordHash: string;
  roles: Array<'USER' | 'ANCHOR' | 'REVIEWER' | 'ADMIN'>;
  walletBalance: number;
}

export async function buildSeedData() {
  const definitions = [
    { username: '姜姜668', displayName: '姜姜668', plaintextPassword: 'abc321', roles: ['USER'] as const, walletBalance: 20000 },
    { username: 'anchor_demo', displayName: '示例主播', plaintextPassword: 'Anchor123!', roles: ['USER', 'ANCHOR'] as const, walletBalance: 50000 },
    { username: 'reviewer', displayName: '内容审核员', plaintextPassword: 'Reviewer123!', roles: ['REVIEWER'] as const, walletBalance: 0 },
    { username: 'admin', displayName: '平台管理员', plaintextPassword: 'Admin123!', roles: ['ADMIN'] as const, walletBalance: 100000 },
  ];

  const users: SeedUser[] = await Promise.all(
    definitions.map(async (user) => ({ ...user, roles: [...user.roles], passwordHash: await hash(user.plaintextPassword) })),
  );

  return {
    users,
    circles: [{ slug: 'anchor-life', name: '主播生活圈', description: '主播动态、直播预告与专属内容。', entryCoins: 99, ownerUsername: 'anchor_demo' }],
    posts: [{ title: '欢迎来到主播生活圈', body: '这是可安全修改的本地演示数据。', authorUsername: 'anchor_demo', circleSlug: 'anchor-life' }],
    liveRooms: [{ title: '主播互动演示间', anchorUsername: 'anchor_demo', viewerCoins: 30, secondViewCoins: 50, streamKey: 'demo-anchor-room' }],
  };
}
