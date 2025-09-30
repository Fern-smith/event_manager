// test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log('Database connected! Users:', users);
  } catch (error) {
    console.error('Database error:', error);
  }
}

test();