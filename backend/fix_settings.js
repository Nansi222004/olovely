import 'dotenv/config';
import mongoose from 'mongoose';
import { invalidate } from './app/services/cacheService.js';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickcommerce');
    const result = await mongoose.connection.collection('settings').updateMany(
      {},
      { $set: { appName: 'Olovely', companyName: 'Olovely Total Suvidha', supportEmail: 'support@olovely.com', logoUrl: '/olovelylogo.jpeg', faviconUrl: '/olovelylogo.jpeg', primaryColor: '#123B8E', secondaryColor: '#1976D2', otpProvider: 'smsIndiaHub' } }
    );
    await invalidate("cache:platform:settings:*");
    await invalidate("cache:catalog:categories:*");
    await invalidate("cache:catalog:productList:*");
    console.log('Updated Settings in DB:', result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
