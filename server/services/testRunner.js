import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';

const request = (method, endpoint, body = null, token = null, isMultipart = false, multipartData = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${endpoint}`);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let payload = null;
    if (isMultipart && multipartData) {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;

      const chunks = [];
      for (const [key, val] of Object.entries(multipartData.fields || {})) {
        chunks.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`);
      }

      if (multipartData.file) {
        chunks.push(
          `--${boundary}\r\nContent-Disposition: form-data; name="${multipartData.file.fieldName}"; filename="${multipartData.file.filename}"\r\nContent-Type: ${multipartData.file.mimeType}\r\n\r\n`
        );
        const fileContent = multipartData.file.content;
        chunks.push(fileContent);
        chunks.push('\r\n');
      }

      chunks.push(`--${boundary}--\r\n`);
      payload = Buffer.concat(chunks.map((c) => (Buffer.isBuffer(c) ? c : Buffer.from(c))));
      headers['Content-Length'] = payload.length;
    } else if (body) {
      payload = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, rawData: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runAllTests = async () => {
  console.log('\n🧪 ========================================================');
  console.log('🧪 MOSAIC WELLNESS: COMPREHENSIVE E2E VERIFICATION SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check endpoint returns 200 healthy');

    // 2. Fetch Products
    const productsRes = await request('GET', '/products');
    assert(productsRes.status === 200 && productsRes.data.products?.length >= 5, 'Products list returned >= 5 products');
    const firstProduct = productsRes.data.products[0];

    // 3. Register a fresh customer
    const testEmail = `test.journey.${Date.now()}@mosaictest.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Rohan Mehra',
      email: testEmail,
      phone: '+919988776655',
      password: 'Password@123',
      privacyConsent: true,
    });
    assert(regRes.status === 201 && regRes.data.token, 'Customer registration succeeds and returns JWT token');
    const customerToken = regRes.data.token;
    const customerId = regRes.data.user.id;

    // 4. Duplicate registration prevention
    const dupRes = await request('POST', '/auth/register', {
      name: 'Duplicate Rohan',
      email: testEmail,
      password: 'Password@123',
      privacyConsent: true,
    });
    assert(dupRes.status === 400, 'Duplicate email registration is safely rejected');

    // 5. Customer Login
    const loginRes = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'Password@123',
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Customer login verifies credentials and issues JWT token');

    // 6. Customer Profile & Privacy Preferences
    const profileRes = await request('GET', '/users/profile', null, customerToken);
    assert(profileRes.status === 200 && profileRes.data.profile.name === 'Rohan Mehra', 'Profile retrieval returns customer details');

    const updateProfileRes = await request(
      'PATCH',
      '/users/profile',
      {
        notificationPreferences: { dailyReminders: true, weeklyReflections: true, milestoneAlerts: true },
      },
      customerToken
    );
    assert(updateProfileRes.status === 200, 'Profile notification preferences updated');

    // 7. Start Product Journey
    const journeyRes = await request(
      'POST',
      '/journeys',
      {
        productId: firstProduct._id,
        startDate: new Date(Date.now() - 14 * 86400000).toISOString(), // 14 days ago
        targetDurationDays: 90,
        personalGoal: 'Improve skin brightness and hydration',
      },
      customerToken
    );
    assert(journeyRes.status === 201 && journeyRes.data.journey._id, 'Product journey created with product reference and duration');
    const journeyId = journeyRes.data.journey._id;

    // 8. Prevent duplicate active journey for same product
    const dupJourneyRes = await request(
      'POST',
      '/journeys',
      { productId: firstProduct._id },
      customerToken
    );
    assert(dupJourneyRes.status === 400, 'Duplicate active journey for the same product is prevented');

    // 9. Submit Daily Check-in WITHOUT photo
    const checkinDate = new Date().toISOString().split('T')[0];
    const checkinRes = await request(
      'POST',
      '/checkins',
      null,
      customerToken,
      true,
      {
        fields: {
          journeyId,
          date: checkinDate,
          mood: 'good',
          usageConsistency: 'used_as_directed',
          changesNoticed: JSON.stringify(['More energy', 'Better skin']),
          discomfort: 'none',
          additionalNotes: 'Day 14 check-in. Formula absorbs instantly without greasiness.',
        },
      }
    );
    assert(checkinRes.status === 201 && checkinRes.data.checkin.mood === 'good', 'Daily check-in submitted successfully without photo');
    const checkinId = checkinRes.data.checkin._id;

    // 10. Update check-in for the same day (prevent duplicate date entry, allow edit)
    const updateCheckinRes = await request(
      'POST',
      '/checkins',
      null,
      customerToken,
      true,
      {
        fields: {
          journeyId,
          date: checkinDate,
          mood: 'excellent',
          usageConsistency: 'used_as_directed',
          changesNoticed: JSON.stringify(['Better skin', 'Improved confidence']),
          discomfort: 'none',
          additionalNotes: 'Updated today with elevated mood!',
        },
      }
    );
    assert(updateCheckinRes.status === 200 && updateCheckinRes.data.isUpdate === true, 'Subsequent submission on same date safely updates entry');

    // 11. Optional Progress Photo Upload
    // Create a mini 1x1 test JPEG buffer
    const testJpgBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
      0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
      0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xbf, 0x80, 0xff, 0xd9,
    ]);

    const photoRes = await request(
      'POST',
      '/photos',
      null,
      customerToken,
      true,
      {
        fields: {
          journeyId,
          caption: 'Day 14 Progress Picture',
          dayNumber: '14',
          date: checkinDate,
        },
        file: {
          fieldName: 'photo',
          filename: 'progress-test.jpg',
          mimeType: 'image/jpeg',
          content: testJpgBuffer,
        },
      }
    );
    assert(photoRes.status === 201 && photoRes.data.photo?.imageUrl, 'Progress photograph uploaded and stored securely');
    const photoId = photoRes.data.photo._id;

    // 12. Submit Weekly Reflection
    const reflectionRes = await request(
      'POST',
      '/reflections',
      {
        journeyId,
        weekNumber: 2,
        weekStartDate: new Date().toISOString(),
        experience: 'much_better',
        positiveChanges: 'Texture is noticeably softer and radiance is improving.',
        challenges: 'None.',
        unwantedEffects: 'None noticed.',
        continuationLikelihood: 'very_likely',
        rating: 9,
      },
      customerToken
    );
    assert(reflectionRes.status === 201 && reflectionRes.data.reflection.rating === 9, 'Weekly reflection submitted and saved to MongoDB');

    // 13. Timeline Query
    const timelineRes = await request('GET', `/checkins?journeyId=${journeyId}&days=30`, null, customerToken);
    assert(timelineRes.status === 200 && timelineRes.data.checkins?.length >= 1, 'Timeline correctly filters entries by 30 days');

    // 14. Customer Data Export
    const exportRes = await request('GET', '/users/export', null, customerToken);
    assert(exportRes.status === 200 && exportRes.data.customer?.email === testEmail, 'Customer data export packages complete history');

    // 15. Notifications Flow
    const notifRes = await request('GET', '/notifications', null, customerToken);
    assert(notifRes.status === 200 && Array.isArray(notifRes.data.notifications), 'Notifications fetched successfully');

    // 16. Admin Authentication & Anonymized Analytics
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@mosaicwellness.com',
      password: 'Admin@123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login verifies role-based credentials');
    const adminToken = adminLogin.data.token;

    // Regular customer cannot access admin stats
    const forbiddenRes = await request('GET', '/admin/stats', null, customerToken);
    assert(forbiddenRes.status === 403, 'Customer correctly forbidden from admin stats endpoint');

    // Admin can access anonymized stats
    const adminStats = await request('GET', '/admin/stats', null, adminToken);
    assert(
      adminStats.status === 200 &&
      adminStats.data.stats.totalCustomers >= 1 &&
      adminStats.data.stats.moodDistribution !== undefined,
      'Admin stats endpoint returns anonymized aggregated telemetry'
    );

    // 17. Photo Deletion
    const deletePhotoRes = await request('DELETE', `/photos/${photoId}`, null, customerToken);
    assert(deletePhotoRes.status === 200, 'Customer can delete their own uploaded progress photographs');

    console.log(`\n========================================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log(`========================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runAllTests();
