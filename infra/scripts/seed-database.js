import database from 'infra/database.js';
import user from 'models/user.js';
import conference from 'models/conference.js';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminUser = await user.create({
      username: 'admin',
      email: 'admin@conference.local',
      password: 'admin123',
      features: ['read:activation_token', 'create:user', 'create:conference', 'create:abstract', 'create:review'],
    });

    console.log('✅ Admin user created:', adminUser.username);

    // Create sample conference
    const sampleConference = await conference.create({
      title: 'Sample Academic Conference 2025',
      description: 'A sample conference for testing the system',
      start_date: new Date('2025-06-01'),
      end_date: new Date('2025-06-03'),
      location: 'Virtual',
      organizer_id: adminUser.id,
      status: 'active',
    });

    console.log('✅ Sample conference created:', sampleConference.title);
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
}

seedDatabase();
