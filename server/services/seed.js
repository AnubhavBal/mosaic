import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Journey from '../models/Journey.js';
import Checkin from '../models/Checkin.js';
import WeeklyReflection from '../models/WeeklyReflection.js';
import ProgressPhoto from '../models/ProgressPhoto.js';
import Notification from '../models/Notification.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Redensyl & Procapil Hair Growth Serum',
    category: 'Haircare',
    description: 'Clinically formulated serum with 3% Redensyl, 2% Procapil, and Saw Palmetto to stimulate hair follicles, reduce shedding, and promote visible density.',
    image: 'https://images.unsplash.com/photo-1608248597359-0a5814523789?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Apply 1-2 ml directly onto a dry or towel-dried scalp before bed. Gently massage with fingertips.',
    expectedResults: 'Reduction in hair fall within 4-6 weeks; visible density improvement in 90 days.',
    recommendedDurationDays: 90,
  },
  {
    name: '10% Vitamin C Radiance & Glow Serum',
    category: 'Skincare',
    description: 'Stabilized Vitamin C formula with Ferulic Acid and Hyaluronic Acid to brighten uneven skin tone, fade dark spots, and protect against environmental damage.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Apply 3-4 drops onto cleansed, dry face each morning before sunscreen.',
    expectedResults: 'Brighter complexion and balanced hydration in 14-28 days.',
    recommendedDurationDays: 60,
  },
  {
    name: 'Biotin, Folic Acid & Zinc Gummies',
    category: 'Nutrition',
    description: 'Delicious strawberry-flavored pectin gummies formulated to nourish hair roots, promote nail strength, and support natural keratin synthesis.',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Chew 1 gummy daily after your morning or evening meal.',
    expectedResults: 'Stronger nails in 30 days; reduced brittleness and healthier strands in 60-90 days.',
    recommendedDurationDays: 90,
  },
  {
    name: '2% Salicylic Acid Clear Body Wash',
    category: 'Bodycare',
    description: 'Exfoliating body cleanser with Salicylic Acid, Tea Tree, and Niacinamide designed to combat body acne, rough skin, and clogged pores.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Lather onto damp skin in the shower, focusing on back and chest. Rinse thoroughly.',
    expectedResults: 'Clearer, smoother skin texture within 2 to 3 weeks.',
    recommendedDurationDays: 60,
  },
  {
    name: 'Pure KSM-66 Ashwagandha Stress & Sleep Capsules',
    category: 'Wellness',
    description: 'High-concentration root extract to help balance cortisol levels, soothe daily stress, and promote restorative, deep sleep cycles.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Take 1 capsule daily after dinner with warm water or milk.',
    expectedResults: 'Improved calmness within 10 days; deeper, consistent sleep quality within 3-4 weeks.',
    recommendedDurationDays: 60,
  },
  {
    name: '1% Hyaluronic Acid Deep Hydration Gel',
    category: 'Skincare',
    description: 'Ultra-lightweight multi-molecular hyaluronic moisturizer with Centella Asiatica for 72-hour sustained moisture without clogged pores.',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Apply liberally over face and neck twice daily after cleansing.',
    expectedResults: 'Supple, bouncy skin barrier starting from Day 1.',
    recommendedDurationDays: 60,
  },
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('🧹 Existing products cleared.');

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${createdProducts.length} wellness products.`);

    // Check or create Admin user
    const adminEmail = 'admin@mosaicwellness.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin@123', salt);
      admin = await User.create({
        name: 'Mosaic Admin',
        email: adminEmail,
        phone: '+919876543210',
        passwordHash,
        role: 'admin',
        privacyConsent: true,
      });
      console.log('👑 Admin user created: admin@mosaicwellness.com / Admin@123');
    }

    // Check or create Demo Customer
    const demoEmail = 'customer@mosaicwellness.com';
    let demoCustomer = await User.findOne({ email: demoEmail });
    if (!demoCustomer) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Customer@123', salt);
      demoCustomer = await User.create({
        name: 'Aanya Sharma',
        email: demoEmail,
        phone: '+919812345678',
        passwordHash,
        role: 'user',
        privacyConsent: true,
      });
      console.log('👤 Demo customer created: customer@mosaicwellness.com / Customer@123');
    }

    // Seed an active journey for demo customer if none exists
    const existingJourney = await Journey.findOne({ userId: demoCustomer._id });
    if (!existingJourney) {
      const hairProduct = createdProducts[0];
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const journey = await Journey.create({
        userId: demoCustomer._id,
        productId: hairProduct._id,
        startDate: tenDaysAgo,
        targetDurationDays: 90,
        personalGoal: 'Reduce seasonal shedding and boost temple density',
        status: 'active',
      });

      console.log(`🚀 Seeded active journey with ${hairProduct.name} started 10 days ago.`);

      // Seed 7 past check-ins to demonstrate streak and calendar
      const pastDays = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
      const moods = ['okay', 'okay', 'good', 'good', 'good', 'good', 'excellent', 'good', 'excellent', 'excellent'];
      const changesList = [
        ['No noticeable changes'],
        ['Feeling calmer'],
        ['Better hair'],
        ['Better hair', 'More energy'],
        ['Better hair', 'Improved confidence'],
        ['Better hair', 'Better sleep'],
        ['Better hair', 'Improved confidence'],
        ['Better hair', 'More energy'],
        ['Better hair', 'Improved confidence', 'Better skin'],
        ['Better hair', 'Improved confidence'],
      ];

      for (let i = 0; i < pastDays.length; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (pastDays.length - 1 - i));
        const dateStr = d.toISOString().split('T')[0];

        const checkin = await Checkin.create({
          userId: demoCustomer._id,
          journeyId: journey._id,
          date: dateStr,
          mood: moods[i],
          usageConsistency: 'used_as_directed',
          changesNoticed: changesList[i],
          discomfort: 'none',
          additionalNotes: i === 0 ? 'Day 1 started! Scalp feels light and non-sticky.' : `Day ${i + 1} routine done right before bed.`,
          photoUrl: i === 0
            ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'
            : (i === 6 ? 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=400&q=80' : ''),
        });

        if (checkin.photoUrl) {
          await ProgressPhoto.create({
            userId: demoCustomer._id,
            journeyId: journey._id,
            checkinId: checkin._id,
            imageUrl: checkin.photoUrl,
            storagePublicId: '',
            caption: i === 0 ? 'Day 1 Baseline Scalp Photo' : 'Day 7 Progress: Noticeable reduction in morning brush shedding',
            dayNumber: i + 1,
            date: dateStr,
          });
        }
      }

      // Seed Week 1 reflection
      const weekStart = new Date(tenDaysAgo);
      await WeeklyReflection.create({
        userId: demoCustomer._id,
        journeyId: journey._id,
        weekNumber: 1,
        weekStartDate: weekStart,
        experience: 'much_better',
        positiveChanges: 'Less hair fall during hair wash and gentle combing. Serum absorbs quickly.',
        challenges: 'Remembering to apply consistently right before sleep.',
        unwantedEffects: 'None noticed.',
        continuationLikelihood: 'very_likely',
        rating: 9,
      });

      // Seed initial notifications
      await Notification.create({
        userId: demoCustomer._id,
        type: 'milestone',
        title: 'Day 7 Milestone Reached! 🌟',
        message: 'You have maintained 7 consecutive days of usage with Redensyl & Procapil Hair Growth Serum.',
        metadata: { journeyId: journey._id, dayNumber: 7 },
      });

      await Notification.create({
        userId: demoCustomer._id,
        type: 'daily_checkin',
        title: 'Check-in time 🌿',
        message: 'How is your scalp feeling today? Submit your quick check-in.',
        metadata: { journeyId: journey._id },
      });

      console.log('✨ Check-ins, photos, reflection, and notifications seeded for demo customer.');
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seed:', error);
  }
};

// If run directly: node services/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(async () => {
    await closeDB();
    process.exit(0);
  });
}
