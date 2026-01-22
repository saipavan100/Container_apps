const User = require('../models/User.model');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(' Admin account already exists');
      return;
    }

    // Create admin
    const admin = new User({
      email: adminEmail,
      password: adminPassword,
      role: 'HR',
      fullName: 'HR Administrator',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin account created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
