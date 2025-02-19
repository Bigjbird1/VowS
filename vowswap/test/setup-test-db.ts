import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    // Reset the test database
    execSync('npx prisma migrate reset --force --skip-seed --preview-feature');

    // Create test user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        hashedPassword,
        role: 'USER',
      },
    });

    // Create test seller
    const sellerPassword = await bcrypt.hash('Seller123!', 10);
    const testSeller = await prisma.user.create({
      data: {
        email: 'seller@example.com',
        name: 'Test Seller',
        hashedPassword: sellerPassword,
        role: 'SELLER',
      },
    });

    // Create test product
    const testProduct = await prisma.product.create({
      data: {
        title: 'Test Product',
        description: 'A test product for testing',
        price: 99.99,
        images: ['test-image.jpg'],
        category: 'test',
        condition: 'new',
        inventory: 10,
        sellerId: testSeller.id,
        tags: ['test'],
      },
    });

    // Create test registry
    const testRegistry = await prisma.registry.create({
      data: {
        userId: testUser.id,
        title: 'Test Wedding Registry',
        eventDate: new Date('2025-12-31'),
        eventType: 'WEDDING',
        coupleName1: 'Test User',
        coupleName2: 'Test Partner',
        eventLocation: 'Test Location',
        uniqueUrl: 'test-registry',
      },
    });

    // Add product to registry
    await prisma.registryItem.create({
      data: {
        registryId: testRegistry.id,
        productId: testProduct.id,
        quantity: 1,
        priority: 'HIGH',
      },
    });

  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default setupTestDatabase;
