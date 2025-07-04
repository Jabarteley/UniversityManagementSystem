import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { logger } from './server/src/utils/logger.js';

dotenv.config({ path: './server/.env' });

interface UserDocument {
  email: string;
  username?: string;
  role?: string;
  password?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  permissions?: Record<string, boolean>;
  isActive?: boolean;
}

async function checkDatabaseConnection(): Promise<void> {
  try {
    logger.info('Connecting to MongoDB...');
    logger.info('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.success('Connected to MongoDB successfully!');

    // Define a flexible user schema to match your existing data
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // Get all users and examine their structure
    const users = await User.find({}) as UserDocument[];
    logger.info(`Found ${users.length} users in database`);

    if (users.length > 0) {
      logger.info('User data structure analysis:');
      
      for (const user of users.slice(0, 3)) { // Check first 3 users
        console.log(`\n📧 Email: ${user.email}`);
        console.log(`👤 Username: ${user.username || 'N/A'}`);
        console.log(`🔑 Role: ${user.role || 'N/A'}`);
        console.log(`🔒 Password field exists: ${user.password ? 'YES' : 'NO'}`);
        
        if (user.password) {
          console.log(`🔒 Password type: ${user.password.startsWith('$2b$') || user.password.startsWith('$2a$') ? 'HASHED' : 'PLAIN TEXT'}`);
          console.log(`🔒 Password length: ${user.password.length}`);
          
          // Test common passwords
          const testPasswords = ['password123', 'admin123', '123456', 'password'];
          
          for (const testPass of testPasswords) {
            let isMatch = false;
            
            try {
              if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                // Hashed password
                isMatch = await bcrypt.compare(testPass, user.password);
              } else {
                // Plain text password
                isMatch = testPass === user.password;
              }
              
              if (isMatch) {
                logger.success(`Password match found: "${testPass}"`);
                break;
              }
            } catch (error) {
              logger.error(`Error testing password "${testPass}":`, error);
            }
          }
        }
        
        // Check profile structure
        if (user.profile) {
          console.log(`👤 Profile: ${user.profile.firstName || 'N/A'} ${user.profile.lastName || 'N/A'}`);
        }
        
        // Check permissions
        if (user.permissions) {
          console.log(`🔐 Permissions: ${Object.keys(user.permissions).length} permission fields`);
        }
        
        console.log(`✅ Active: ${user.isActive !== false ? 'YES' : 'NO'}`);
        console.log('---');
      }
    } else {
      logger.warning('No users found in database!');
    }

  } catch (error) {
    logger.error('Database connection failed:', error);
    
    if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
      logger.info('Possible solutions:');
      logger.info('   1. Check if MongoDB is running');
      logger.info('   2. Verify MONGODB_URI in server/.env file');
      logger.info('   3. Check network connectivity');
    }
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

checkDatabaseConnection();