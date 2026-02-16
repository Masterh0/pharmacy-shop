// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // ✅ ساخت اکانت مدیر
    const hashedPassword = await bcrypt.hash('hossein1709', 10);

    const adminUser = await prisma.user.upsert({
      where: { phone: '09163182903' },
      update: {},
      create: {
        phone: '09163182903',
        password: hashedPassword,
        hasPassword: true,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        name: 'Hossein (Admin)',
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ Admin user created/updated:', {
      id: adminUser.id,
      phone: adminUser.phone,
      role: adminUser.role,
      name: adminUser.name,
    });

    // 🎨 می‌تونید برند‌ها و دسته‌بندی‌های پیش‌فرض اضافه کنید
    console.log('\n📦 Adding sample brands...');
    
    await prisma.brand.createMany({
      data: [
        { name: 'داروپخش', slug: 'daroupakhsh' },
        { name: 'دارویی سبحان', slug: 'darouie-sobhan' },
        { name: 'ابوریحان', slug: 'abou-reihan' },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Sample brands created');

    // 📁 دسته‌بندی‌های پیش‌فرض
    console.log('\n📁 Adding sample categories...');
    
    const parentCat = await prisma.category.upsert({
      where: { slug: 'medicine' },
      update: {},
      create: {
        name: 'دارو',
        slug: 'medicine',
      },
    });

    await prisma.category.createMany({
      data: [
        { name: 'آنتی‌بیوتیک', slug: 'antibiotic', parentId: parentCat.id },
        { name: 'مسکن', slug: 'painkiller', parentId: parentCat.id },
        { name: 'ویتامین', slug: 'vitamin', parentId: parentCat.id },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Sample categories created');

    console.log('\n🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
