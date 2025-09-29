const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const tests = await prisma.test.findMany();
    res.json({ message: 'Backend is running!', tests });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));