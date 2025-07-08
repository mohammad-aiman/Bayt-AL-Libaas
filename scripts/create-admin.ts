const connectDB = require('../src/lib/mongodb').default;
const User = require('../src/models/User').default;

async function createAdmin() {
  try {
    await connectDB();

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@baytallibaas.com',
      password: 'admin123', // This will be hashed automatically
      role: 'admin',
      provider: 'credentials',
      isActive: true
    });

    console.log('Admin user created successfully:', adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin(); 