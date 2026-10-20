import { verify } from '@node-rs/argon2';
import { buildSeedData } from '../prisma/seed-data';

describe('platform seed identities', () => {
  it('creates all demo roles, wallets, and content without plaintext passwords', async () => {
    const seed = await buildSeedData();
    const byUsername = new Map(seed.users.map((user) => [user.username, user]));

    expect([...byUsername.keys()]).toEqual(
      expect.arrayContaining(['姜姜668', 'anchor_demo', 'reviewer', 'admin']),
    );
    expect(byUsername.get('姜姜668')?.roles).toContain('USER');
    expect(byUsername.get('anchor_demo')?.roles).toEqual(expect.arrayContaining(['USER', 'ANCHOR']));
    expect(byUsername.get('reviewer')?.roles).toContain('REVIEWER');
    expect(byUsername.get('admin')?.roles).toContain('ADMIN');

    for (const user of seed.users) {
      expect(user.passwordHash).not.toBe(user.plaintextPassword);
      expect(await verify(user.passwordHash, user.plaintextPassword)).toBe(true);
      expect(user.walletBalance).toBeGreaterThanOrEqual(0);
    }

    expect(seed.circles.length).toBeGreaterThan(0);
    expect(seed.posts.length).toBeGreaterThan(0);
    expect(seed.liveRooms.length).toBeGreaterThan(0);
  });
});
