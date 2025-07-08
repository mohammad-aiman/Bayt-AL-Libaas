import connectDB from '../src/lib/mongodb';
import Category from '../src/models/Category';
import Product from '../src/models/Product';
import User from '../src/models/User';

const categories = [
  {
    name: 'Casual Wear',
    slug: 'casual-wear',
    description: 'Comfortable and stylish everyday clothing',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Formal Attire',
    slug: 'formal-attire',
    description: 'Elegant office and business clothing',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Evening Wear',
    slug: 'evening-wear',
    description: 'Stunning dresses for special occasions',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look with our accessories',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
];

const products = [
  {
    name: 'Elegant Maxi Dress',
    slug: 'elegant-maxi-dress',
    description: 'A beautiful flowing maxi dress perfect for evening occasions. Made from premium fabric with intricate details and comfortable fit.',
    price: 2999,
    discountPrice: 2399,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Burgundy'],
    stock: 25,
    rating: 4.8,
    numReviews: 124,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Casual Cotton Blouse',
    slug: 'casual-cotton-blouse',
    description: 'Comfortable cotton blouse perfect for everyday wear. Lightweight and breathable with a relaxed fit.',
    price: 1599,
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Light Blue', 'Pink', 'Mint Green'],
    stock: 50,
    rating: 4.6,
    numReviews: 89,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Professional Blazer',
    slug: 'professional-blazer',
    description: 'Tailored blazer perfect for office wear. Classic design with modern touches and excellent fit.',
    price: 3499,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray', 'Camel'],
    stock: 30,
    rating: 4.9,
    numReviews: 156,
    isFeatured: true,
    isActive: true,
  },
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@baytallibaas.com',
  password: 'admin123',
  role: 'admin',
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    await User.create(adminUser);
    console.log('👤 Created admin user');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`📂 Created ${createdCategories.length} categories`);

    // Assign category IDs to products
    const productsWithCategories = products.map((product, index) => ({
      ...product,
      category: createdCategories[index % createdCategories.length]._id,
    }));

    // Create products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`🛍️  Created ${createdProducts.length} products`);

    console.log('✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log('- Admin user: 1');
    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@baytallibaas.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 