import prisma from '../src/lib/prisma'

async function main() {
  const response = await Promise.all([
    prisma.user.upsert({
      where: { email: 'rauchg@vercel.com' },
      update: {},
      create: {
        name: 'Guillermo Rauch',
        email: 'rauchg@vercel.com',
        password: 'password',
      },
    }),
    prisma.user.upsert({
      where: { email: 'lee@vercel.com' },
      update: {},
      create: {
        name: 'Lee Robinson',
        email: 'lee@vercel.com',
        password: 'password',
      },
    }),
    prisma.user.upsert({
      where: { email: 'stey@vercel.com' },
      update: {},
      create: {
        name: 'Steven Tey',
        email: 'stey@vercel.com',
        password: 'password',
      },
    }),
  ])
  console.log(response)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
