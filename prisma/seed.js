// @ts-check
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed the database...');

  // 1. Add a YouTube channel
  console.log('📺 Adding a YouTube channel...');
  const channel = await prisma.youtubeChannel.upsert({
    where: { channelId: 'UCWJvQParwDmFaXefhpAKXlQ' },
    update: {},
    create: {
      channelId: 'UCWJvQParwDmFaXefhpAKXlQ', // Fireship
      title: 'Fireship',
      description: 'High-intensity ⚡ code tutorials and tech news',
      thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AMLnZu80d66aj0mK3KEyMfpdGFyrVWdV5tfezE17IwRipQ=s176-c-k-c0x00ffffff-no-rj',
      subscriberCount: 2000000,
      isActive: true
    }
  });
  console.log(`✅ Channel added: ${channel.title}`);

  // 2. Add some videos
  console.log('🎬 Adding YouTube videos...');

  const video1 = await prisma.youtubeVideoCache.upsert({
    where: { videoId: 'rZ41y93P2Qo' },
    update: {},
    create: {
      videoId: 'rZ41y93P2Qo',
      title: 'Next.js in 100 Seconds',
      description: 'Next.js is a React framework for building full-stack web applications...',
      thumbnailUrl: 'https://i.ytimg.com/vi/rZ41y93P2Qo/hqdefault.jpg',
      channelTitle: 'Fireship',
      channelId: 'UCWJvQParwDmFaXefhpAKXlQ',
      publishedAt: '2023-05-15T14:00:00Z',
      videoUrl: `https://www.youtube.com/watch?v=rZ41y93P2Qo`,
      duration: '2:47',
      durationSeconds: 167,
      state: 'A voir !'
    }
  });

  const video2 = await prisma.youtubeVideoCache.upsert({
    where: { videoId: 'DHjZnJRK_S8' },
    update: {},
    create: {
      videoId: 'DHjZnJRK_S8',
      title: 'PostgreSQL in 100 Seconds',
      description: 'PostgreSQL is a powerful open-source relational database...',
      thumbnailUrl: 'https://i.ytimg.com/vi/DHjZnJRK_S8/hqdefault.jpg',
      channelTitle: 'Fireship',
      channelId: 'UCWJvQParwDmFaXefhpAKXlQ',
      publishedAt: '2023-03-10T15:00:00Z',
      videoUrl: `https://www.youtube.com/watch?v=DHjZnJRK_S8`,
      duration: '2:15',
      durationSeconds: 135,
      state: 'Impressionnant'
    }
  });

  const video3 = await prisma.youtubeVideoCache.upsert({
    where: { videoId: 'LFJrQnvAPRQ' },
    update: {},
    create: {
      videoId: 'LFJrQnvAPRQ',
      title: 'JavaScript Frameworks - the TRUTH',
      description: 'Are JavaScript frameworks worth learning? Which one is best?',
      thumbnailUrl: 'https://i.ytimg.com/vi/LFJrQnvAPRQ/hqdefault.jpg',
      channelTitle: 'Fireship',
      channelId: 'UCWJvQParwDmFaXefhpAKXlQ',
      publishedAt: '2023-02-10T14:00:00Z',
      videoUrl: `https://www.youtube.com/watch?v=LFJrQnvAPRQ`,
      duration: '3:15',
      durationSeconds: 195,
      state: 'Recommander'
    }
  });

  console.log(`✅ Added ${3} videos`);

  // 3. Add video states
  await prisma.videoState.upsert({
    where: { videoId: 'rZ41y93P2Qo' },
    update: { state: 'A voir !', notes: 'Interesting tutorial about Next.js' },
    create: {
      videoId: 'rZ41y93P2Qo',
      state: 'A voir !',
      duration: '2:47',
      durationSeconds: 167,
      notes: 'Interesting tutorial about Next.js'
    }
  });

  await prisma.videoState.upsert({
    where: { videoId: 'DHjZnJRK_S8' },
    update: { state: 'Impressionnant', notes: 'Great PostgreSQL overview' },
    create: {
      videoId: 'DHjZnJRK_S8',
      state: 'Impressionnant',
      duration: '2:15',
      durationSeconds: 135,
      notes: 'Great PostgreSQL overview'
    }
  });

  await prisma.videoState.upsert({
    where: { videoId: 'LFJrQnvAPRQ' },
    update: { state: 'Recommander', notes: 'Good framework comparison' },
    create: {
      videoId: 'LFJrQnvAPRQ',
      state: 'Recommander',
      duration: '3:15',
      durationSeconds: 195,
      notes: 'Good framework comparison'
    }
  });

  console.log(`✅ Added video states`);

  // 4. Add themes
  const reactTheme = await prisma.theme.upsert({
    where: { name: 'React' },
    update: {},
    create: {
      name: 'React',
      description: 'React framework and ecosystem',
      color: '#61dafb'
    }
  });

  const dbTheme = await prisma.theme.upsert({
    where: { name: 'Database' },
    update: {},
    create: {
      name: 'Database',
      description: 'Database technologies',
      color: '#336791'
    }
  });

  const jsTheme = await prisma.theme.upsert({
    where: { name: 'JavaScript' },
    update: {},
    create: {
      name: 'JavaScript',
      description: 'JavaScript language and ecosystem',
      color: '#f7df1e'
    }
  });

  console.log(`✅ Added themes`);

  // 5. Associate themes with videos
  await prisma.videoTheme.upsert({
    where: {
      videoId_themeId: {
        videoId: 'rZ41y93P2Qo',
        themeId: reactTheme.id
      }
    },
    update: {},
    create: {
      videoId: 'rZ41y93P2Qo',
      themeId: reactTheme.id
    }
  });

  await prisma.videoTheme.upsert({
    where: {
      videoId_themeId: {
        videoId: 'DHjZnJRK_S8',
        themeId: dbTheme.id
      }
    },
    update: {},
    create: {
      videoId: 'DHjZnJRK_S8',
      themeId: dbTheme.id
    }
  });

  await prisma.videoTheme.upsert({
    where: {
      videoId_themeId: {
        videoId: 'LFJrQnvAPRQ',
        themeId: jsTheme.id
      }
    },
    update: {},
    create: {
      videoId: 'LFJrQnvAPRQ',
      themeId: jsTheme.id
    }
  });

  console.log(`✅ Associated themes with videos`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding the database:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 