require('dotenv').config();
const mongoose = require('mongoose');
const Branch = require('../models/Branch');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('\n========================================');
    console.log('🌱 SEEDING DATABASE');
    console.log('========================================\n');

    // Check if branch already exists
    const existingBranch = await Branch.findOne({ code: 'MAIN' });
    
    let branch;
    
    if (existingBranch) {
      console.log('⚠️  Main branch already exists');
      branch = existingBranch;
    } else {
      // Create main branch
      branch = await Branch.create({
        name: 'Main Branch',
        code: 'MAIN',
        address: '123 Gym Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        phone: '+91 9876543210',
        email: 'main@yourgym.com',
        isActive: true
      });
      console.log('✅ Main branch created');
      console.log(`   ID: ${branch._id}`);
      console.log(`   Name: ${branch.name}`);
      console.log(`   Code: ${branch.code}\n`);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gym.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}\n`);
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@gym.com',
        password: 'admin123456',
        role: 'admin',
        branchId: branch._id,
        phone: '+91 9876543210',
        isActive: true
      });
      
      console.log('✅ Admin user created');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin123456`);
      console.log(`   Role: ${admin.role}\n`);
    }

    // Create trainer user
    const existingTrainer = await User.findOne({ email: 'trainer@gym.com' });
    
    if (existingTrainer) {
      console.log('⚠️  Trainer user already exists\n');
    } else {
      const trainer = await User.create({
        name: 'Trainer User',
        email: 'trainer@gym.com',
        password: 'trainer123456',
        role: 'trainer',
        branchId: branch._id,
        phone: '+91 9876543211',
        isActive: true
      });
      
      console.log('✅ Trainer user created');
      console.log(`   Email: ${trainer.email}`);
      console.log(`   Password: trainer123456`);
      console.log(`   Role: ${trainer.role}\n`);
    }

    console.log('========================================');
    console.log('🎉 DATABASE SEEDING COMPLETED!');
    console.log('========================================\n');
    
    console.log('📝 LOGIN CREDENTIALS:\n');
    console.log('ADMIN:');
    console.log('  Email: admin@gym.com');
    console.log('  Password: admin123456\n');
    console.log('TRAINER:');
    console.log('  Email: trainer@gym.com');
    console.log('  Password: trainer123456\n');
    
    console.log('⚠️  IMPORTANT: Change these passwords after first login!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

connectDB().then(() => seedDatabase());


