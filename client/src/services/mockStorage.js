// Client-side fallback storage engine
// Ensures the application remains fully functional even when hosted on static hosting (like GitHub Pages or Vercel)
// without requiring an external backend or database connection!

const STORAGE_KEYS = {
  USERS: 'bw_users',
  PRODUCTS: 'bw_products',
  JOURNEYS: 'bw_journeys',
  CHECKINS: 'bw_checkins',
  PHOTOS: 'bw_photos',
  REFLECTIONS: 'bw_reflections',
  NOTIFICATIONS: 'bw_notifications',
  CURRENT_USER: 'mosaic_user',
  TOKEN: 'mosaic_token',
};

const defaultProducts = [
  {
    _id: 'prod_1',
    name: 'Redensyl & Procapil Hair Growth Serum',
    category: 'Haircare',
    description: 'Clinically formulated serum with 3% Redensyl, 2% Procapil, and Saw Palmetto to stimulate hair follicles, reduce shedding, and promote visible density.',
    image: 'https://images.unsplash.com/photo-1608248597359-0a5814523789?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Apply 1-2 ml directly onto a dry or towel-dried scalp before bed. Gently massage with fingertips.',
    expectedResults: 'Reduction in hair fall within 4-6 weeks; visible density improvement in 90 days.',
    recommendedDurationDays: 90,
    isActive: true,
  },
  {
    _id: 'prod_2',
    name: '10% Vitamin C Radiance & Glow Serum',
    category: 'Skincare',
    description: 'Stabilized Vitamin C formula with Ferulic Acid and Hyaluronic Acid to brighten uneven skin tone, fade dark spots, and protect against environmental damage.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Apply 3-4 drops onto cleansed, dry face each morning before sunscreen.',
    expectedResults: 'Brighter complexion and balanced hydration in 14-28 days.',
    recommendedDurationDays: 60,
    isActive: true,
  },
  {
    _id: 'prod_3',
    name: 'Biotin, Folic Acid & Zinc Gummies',
    category: 'Nutrition',
    description: 'Delicious strawberry-flavored pectin gummies formulated to nourish hair roots, promote nail strength, and support natural keratin synthesis.',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Chew 1 gummy daily after your morning or evening meal.',
    expectedResults: 'Stronger nails in 30 days; reduced brittleness and healthier strands in 60-90 days.',
    recommendedDurationDays: 90,
    isActive: true,
  },
  {
    _id: 'prod_4',
    name: '2% Salicylic Acid Clear Body Wash',
    category: 'Bodycare',
    description: 'Exfoliating body cleanser with Salicylic Acid, Tea Tree, and Niacinamide designed to combat body acne, rough skin, and clogged pores.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Lather onto damp skin in the shower, focusing on back and chest. Rinse thoroughly.',
    expectedResults: 'Clearer, smoother skin texture within 2 to 3 weeks.',
    recommendedDurationDays: 60,
    isActive: true,
  },
  {
    _id: 'prod_5',
    name: 'Pure KSM-66 Ashwagandha Stress & Sleep Capsules',
    category: 'Wellness',
    description: 'High-concentration root extract to help balance cortisol levels, soothe daily stress, and promote restorative, deep sleep cycles.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Take 1 capsule daily after dinner with warm water or milk.',
    expectedResults: 'Improved calmness within 10 days; deeper, consistent sleep quality within 3-4 weeks.',
    recommendedDurationDays: 60,
    isActive: true,
  },
  {
    _id: 'prod_6',
    name: '1% Hyaluronic Acid Deep Hydration Gel',
    category: 'Skincare',
    description: 'Ultra-lightweight multi-molecular hyaluronic moisturizer with Centella Asiatica for 72-hour sustained moisture without clogged pores.',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
    usageInstructions: 'Apply liberally over face and neck twice daily after cleansing.',
    expectedResults: 'Supple, bouncy skin barrier starting from Day 1.',
    recommendedDurationDays: 60,
    isActive: true,
  },
];

export const initClientStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
  }

  // Pre-seed demo users if not present
  let existingUsers = [];
  try {
    existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  } catch (e) {
    existingUsers = [];
  }

  const hasCustomer = existingUsers.some((u) => u.email === 'customer@mosaicwellness.com');
  const hasAdmin = existingUsers.some((u) => u.email === 'admin@mosaicwellness.com');

  const demoUser = {
    id: 'usr_demo_1',
    name: 'Aanya Sharma',
    email: 'customer@mosaicwellness.com',
    phone: '+919812345678',
    role: 'user',
    notificationPreferences: {
      dailyReminders: true,
      weeklyReflections: true,
      milestoneAlerts: true,
      browserEnabled: false,
    },
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  };

  const adminUser = {
    id: 'usr_admin_1',
    name: 'Be Bodywise Admin',
    email: 'admin@mosaicwellness.com',
    phone: '+919876543210',
    role: 'admin',
    notificationPreferences: {
      dailyReminders: true,
      weeklyReflections: true,
      milestoneAlerts: true,
      browserEnabled: false,
    },
    createdAt: new Date().toISOString(),
  };

  if (!hasCustomer) existingUsers.unshift(demoUser);
  if (!hasAdmin) existingUsers.push(adminUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));

  // Seed Demo Journey if not initialized
  if (!localStorage.getItem(STORAGE_KEYS.JOURNEYS)) {
    const startDate = new Date(Date.now() - 10 * 86400000);
    const demoJourney = {
      _id: 'jrn_demo_1',
      userId: demoUser.id,
      productId: defaultProducts[0],
      startDate: startDate.toISOString(),
      targetDurationDays: 90,
      personalGoal: 'Reduce seasonal shedding and boost temple density',
      status: 'active',
      createdAt: startDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify([demoJourney]));

    // Seed 10 Past Check-ins
    const pastCheckins = [];
    const pastPhotos = [];
    const moods = ['okay', 'okay', 'good', 'good', 'good', 'good', 'excellent', 'good', 'excellent', 'excellent'];
    
    for (let i = 0; i < 10; i++) {
      const d = new Date(Date.now() - (9 - i) * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const photoUrl = i === 0
        ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'
        : (i === 6 ? 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=400&q=80' : '');

      const checkin = {
        _id: `chk_${i + 1}`,
        userId: demoUser.id,
        journeyId: demoJourney._id,
        date: dateStr,
        mood: moods[i],
        usageConsistency: 'used_as_directed',
        changesNoticed: ['Better hair', 'Improved confidence'],
        discomfort: 'none',
        additionalNotes: i === 0 ? 'Day 1 baseline routine started!' : `Day ${i + 1} application done before bed.`,
        photoUrl,
        photoPublicId: photoUrl ? `photo_local_${i + 1}` : '',
        createdAt: d.toISOString(),
      };
      pastCheckins.push(checkin);

      if (photoUrl) {
        pastPhotos.push({
          _id: `pht_${i + 1}`,
          userId: demoUser.id,
          journeyId: demoJourney._id,
          checkinId: checkin._id,
          imageUrl: photoUrl,
          storagePublicId: checkin.photoPublicId,
          caption: i === 0 ? 'Day 1 Baseline Scalp Photo' : 'Day 7 Progress Photo',
          dayNumber: i + 1,
          date: dateStr,
          uploadedAt: d.toISOString(),
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(pastCheckins));
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(pastPhotos));

    // Seed Reflection
    const reflection = {
      _id: 'ref_1',
      userId: demoUser.id,
      journeyId: demoJourney._id,
      weekNumber: 1,
      weekStartDate: startDate.toISOString(),
      experience: 'much_better',
      positiveChanges: 'Less hair fall during hair wash and gentle combing. Serum absorbs quickly.',
      challenges: 'Remembering to apply consistently right before sleep.',
      unwantedEffects: 'None noticed.',
      continuationLikelihood: 'very_likely',
      rating: 9,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify([reflection]));

    // Seed Notifications
    const notifs = [
      {
        _id: 'notif_1',
        userId: demoUser.id,
        type: 'milestone',
        title: 'Day 7 Milestone Reached! 🌟',
        message: 'You have maintained 7 consecutive days of usage with Redensyl & Procapil Hair Growth Serum.',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        _id: 'notif_2',
        userId: demoUser.id,
        type: 'daily_checkin',
        title: 'Check-in time 💧',
        message: 'How is your experience today? Take 30 seconds to log your progress.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }
};

// Helper getter & setter
const getItems = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setItems = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const mockStorage = {
  // AUTH
  login: async ({ email, password }) => {
    initClientStorage();
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getItems(STORAGE_KEYS.USERS);
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      const token = `mock_jwt_token_${user.id}_${Date.now()}`;
      return { success: true, token, user };
    }
    // Auto-create or allow password
    if (cleanEmail && cleanEmail.includes('@')) {
      const newUser = {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        notificationPreferences: { dailyReminders: true, weeklyReflections: true, milestoneAlerts: true },
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      setItems(STORAGE_KEYS.USERS, users);
      const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
      return { success: true, token, user: newUser };
    }
    throw new Error('Please enter a valid email address.');
  },

  register: async (userData) => {
    initClientStorage();
    const users = getItems(STORAGE_KEYS.USERS);
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      // If user already exists, log them right in
      const token = `mock_jwt_token_${existing.id}_${Date.now()}`;
      return { success: true, token, user: existing };
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      role: 'user',
      notificationPreferences: { dailyReminders: true, weeklyReflections: true, milestoneAlerts: true },
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setItems(STORAGE_KEYS.USERS, users);
    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    return { success: true, token, user: newUser };
  },

  // PRODUCTS
  getProducts: async () => {
    initClientStorage();
    return { success: true, count: defaultProducts.length, products: defaultProducts };
  },

  getProductById: async (id) => {
    initClientStorage();
    const product = defaultProducts.find((p) => p._id === id) || defaultProducts[0];
    return { success: true, product };
  },

  // JOURNEYS
  getJourneys: async (userId) => {
    initClientStorage();
    const allJourneys = getItems(STORAGE_KEYS.JOURNEYS);
    const userJourneys = allJourneys.filter((j) => j.userId === userId || userId === 'usr_demo_1');
    const checkins = getItems(STORAGE_KEYS.CHECKINS);
    const reflections = getItems(STORAGE_KEYS.REFLECTIONS);
    const todayStr = new Date().toISOString().split('T')[0];

    const withStats = userJourneys.map((j) => {
      const startDate = new Date(j.startDate);
      startDate.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const daysUsing = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1);

      const jCheckins = checkins.filter((c) => c.journeyId === j._id);
      const jReflections = reflections.filter((r) => r.journeyId === j._id);
      const checkedInToday = jCheckins.some((c) => c.date === todayStr);

      return {
        ...j,
        daysUsing,
        currentStreak: jCheckins.length > 0 ? jCheckins.length : 1,
        totalCheckins: jCheckins.length,
        reflectionsCount: jReflections.length,
        checkedInToday,
      };
    });

    return { success: true, journeys: withStats };
  },

  createJourney: async (userId, data) => {
    initClientStorage();
    const journeys = getItems(STORAGE_KEYS.JOURNEYS);
    const products = getItems(STORAGE_KEYS.PRODUCTS);
    const product = products.find((p) => p._id === data.productId) || defaultProducts[0];

    const newJourney = {
      _id: `jrn_${Date.now()}`,
      userId,
      productId: product,
      startDate: data.startDate || new Date().toISOString(),
      targetDurationDays: data.targetDurationDays || 90,
      personalGoal: data.personalGoal || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysUsing: 1,
      currentStreak: 0,
      totalCheckins: 0,
      reflectionsCount: 0,
      checkedInToday: false,
    };
    journeys.unshift(newJourney);
    setItems(STORAGE_KEYS.JOURNEYS, journeys);
    return { success: true, journey: newJourney };
  },

  getJourneyById: async (journeyId) => {
    initClientStorage();
    const journeys = getItems(STORAGE_KEYS.JOURNEYS);
    const journey = journeys.find((j) => j._id === journeyId) || journeys[0];
    return { success: true, journey };
  },

  updateJourney: async (journeyId, data) => {
    initClientStorage();
    const journeys = getItems(STORAGE_KEYS.JOURNEYS);
    const idx = journeys.findIndex((j) => j._id === journeyId);
    if (idx !== -1) {
      journeys[idx] = { ...journeys[idx], ...data, updatedAt: new Date().toISOString() };
      setItems(STORAGE_KEYS.JOURNEYS, journeys);
      return { success: true, journey: journeys[idx] };
    }
    throw new Error('Journey not found');
  },

  deleteJourney: async (journeyId) => {
    initClientStorage();
    let journeys = getItems(STORAGE_KEYS.JOURNEYS);
    journeys = journeys.filter((j) => j._id !== journeyId);
    setItems(STORAGE_KEYS.JOURNEYS, journeys);
    return { success: true };
  },

  // CHECKINS
  getCheckins: async (userId, params = {}) => {
    initClientStorage();
    let checkins = getItems(STORAGE_KEYS.CHECKINS);
    if (params.journeyId) {
      checkins = checkins.filter((c) => c.journeyId === params.journeyId);
    }
    if (params.days && params.days !== 'all') {
      const numDays = parseInt(params.days, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - numDays);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      checkins = checkins.filter((c) => c.date >= cutoffStr);
    }
    checkins.sort((a, b) => b.date.localeCompare(a.date));
    return { success: true, count: checkins.length, checkins };
  },

  submitCheckin: async (userId, formData) => {
    initClientStorage();
    const journeyId = formData.get('journeyId');
    const mood = formData.get('mood');
    const usageConsistency = formData.get('usageConsistency') || 'used_as_directed';
    const changesNoticedRaw = formData.get('changesNoticed');
    let changesNoticed = [];
    try {
      changesNoticed = JSON.parse(changesNoticedRaw);
    } catch (e) {
      changesNoticed = changesNoticedRaw ? [changesNoticedRaw] : [];
    }
    const discomfort = formData.get('discomfort') || 'none';
    const additionalNotes = formData.get('additionalNotes') || '';
    const date = formData.get('date') || new Date().toISOString().split('T')[0];
    const photoFile = formData.get('photo');

    let photoUrl = '';
    if (photoFile && typeof photoFile === 'object' && photoFile.size > 0) {
      photoUrl = URL.createObjectURL(photoFile);
    }

    const checkins = getItems(STORAGE_KEYS.CHECKINS);
    const existingIdx = checkins.findIndex((c) => c.journeyId === journeyId && c.date === date);

    let checkin;
    let isUpdate = false;

    if (existingIdx !== -1) {
      isUpdate = true;
      checkin = {
        ...checkins[existingIdx],
        mood,
        usageConsistency,
        changesNoticed,
        discomfort,
        additionalNotes,
        photoUrl: photoUrl || checkins[existingIdx].photoUrl,
        updatedAt: new Date().toISOString(),
      };
      checkins[existingIdx] = checkin;
    } else {
      checkin = {
        _id: `chk_${Date.now()}`,
        userId,
        journeyId,
        date,
        mood,
        usageConsistency,
        changesNoticed,
        discomfort,
        additionalNotes,
        photoUrl,
        createdAt: new Date().toISOString(),
      };
      checkins.unshift(checkin);
    }

    setItems(STORAGE_KEYS.CHECKINS, checkins);

    if (photoUrl) {
      const photos = getItems(STORAGE_KEYS.PHOTOS);
      photos.unshift({
        _id: `pht_${Date.now()}`,
        userId,
        journeyId,
        checkinId: checkin._id,
        imageUrl: photoUrl,
        caption: additionalNotes || `Progress Photo (${date})`,
        dayNumber: 1,
        date,
        uploadedAt: new Date().toISOString(),
      });
      setItems(STORAGE_KEYS.PHOTOS, photos);
    }

    return { success: true, checkin, isUpdate, message: 'Check-in saved successfully!' };
  },

  deleteCheckin: async (checkinId) => {
    initClientStorage();
    let checkins = getItems(STORAGE_KEYS.CHECKINS);
    checkins = checkins.filter((c) => c._id !== checkinId);
    setItems(STORAGE_KEYS.CHECKINS, checkins);
    return { success: true };
  },

  getCheckinById: async (checkinId) => {
    initClientStorage();
    const checkins = getItems(STORAGE_KEYS.CHECKINS);
    const checkin = checkins.find((c) => c._id === checkinId) || checkins[0];
    return { success: Boolean(checkin), checkin };
  },

  // PHOTOS
  getPhotos: async (userId, params = {}) => {
    initClientStorage();
    let photos = getItems(STORAGE_KEYS.PHOTOS);
    if (params.journeyId) {
      photos = photos.filter((p) => p.journeyId === params.journeyId);
    }
    return { success: true, count: photos.length, photos };
  },

  deletePhoto: async (photoId) => {
    initClientStorage();
    let photos = getItems(STORAGE_KEYS.PHOTOS);
    photos = photos.filter((p) => p._id !== photoId);
    setItems(STORAGE_KEYS.PHOTOS, photos);
    return { success: true };
  },

  // REFLECTIONS
  getReflections: async (userId, params = {}) => {
    initClientStorage();
    let reflections = getItems(STORAGE_KEYS.REFLECTIONS);
    if (params.journeyId) {
      reflections = reflections.filter((r) => r.journeyId === params.journeyId);
    }
    return { success: true, count: reflections.length, reflections };
  },

  submitReflection: async (userId, data) => {
    initClientStorage();
    const reflections = getItems(STORAGE_KEYS.REFLECTIONS);
    const existingIdx = reflections.findIndex(
      (r) => r.journeyId === data.journeyId && r.weekNumber === data.weekNumber
    );
    let reflection;
    let isUpdate = false;

    if (existingIdx !== -1) {
      isUpdate = true;
      reflection = { ...reflections[existingIdx], ...data, updatedAt: new Date().toISOString() };
      reflections[existingIdx] = reflection;
    } else {
      reflection = {
        _id: `ref_${Date.now()}`,
        userId,
        ...data,
        createdAt: new Date().toISOString(),
      };
      reflections.unshift(reflection);
    }
    setItems(STORAGE_KEYS.REFLECTIONS, reflections);
    return { success: true, reflection, isUpdate };
  },

  getReflectionById: async (reflectionId) => {
    initClientStorage();
    const reflections = getItems(STORAGE_KEYS.REFLECTIONS);
    const reflection = reflections.find((r) => r._id === reflectionId) || reflections[0];
    return { success: Boolean(reflection), reflection };
  },

  // NOTIFICATIONS
  getNotifications: async (userId) => {
    initClientStorage();
    const notifications = getItems(STORAGE_KEYS.NOTIFICATIONS);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { success: true, unreadCount, notifications };
  },

  markAsRead: async (notifId) => {
    initClientStorage();
    const notifications = getItems(STORAGE_KEYS.NOTIFICATIONS);
    const idx = notifications.findIndex((n) => n._id === notifId);
    if (idx !== -1) {
      notifications[idx].isRead = true;
      setItems(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
    return { success: true };
  },

  markAllAsRead: async () => {
    initClientStorage();
    const notifications = getItems(STORAGE_KEYS.NOTIFICATIONS);
    notifications.forEach((n) => (n.isRead = true));
    setItems(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return { success: true };
  },

  // ADMIN
  getAdminStats: async () => {
    initClientStorage();
    const users = getItems(STORAGE_KEYS.USERS);
    const journeys = getItems(STORAGE_KEYS.JOURNEYS);
    const checkins = getItems(STORAGE_KEYS.CHECKINS);
    const reflections = getItems(STORAGE_KEYS.REFLECTIONS);

    return {
      success: true,
      stats: {
        totalCustomers: users.length,
        totalJourneys: journeys.length,
        activeJourneys: journeys.filter((j) => j.status === 'active').length,
        completedJourneys: journeys.filter((j) => j.status === 'completed').length,
        retentionRate: 92,
        totalCheckins: checkins.length,
        totalReflections: reflections.length,
        avgReflectionRating: 9.1,
        moodDistribution: {
          excellent: checkins.filter((c) => c.mood === 'excellent').length,
          good: checkins.filter((c) => c.mood === 'good').length,
          okay: checkins.filter((c) => c.mood === 'okay').length,
          bad: checkins.filter((c) => c.mood === 'bad').length,
          very_bad: checkins.filter((c) => c.mood === 'very_bad').length,
        },
        discomfortBreakdown: {
          none: checkins.filter((c) => c.discomfort === 'none').length,
          mild: checkins.filter((c) => c.discomfort === 'mild').length,
          moderate: 0,
          significant: 0,
          described_in_notes: 0,
        },
        journeysByProduct: [
          { productId: 'prod_1', productName: 'Redensyl & Procapil Hair Growth Serum', category: 'Haircare', activeJourneys: 1 },
        ],
      },
    };
  },
};
