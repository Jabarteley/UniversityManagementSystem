import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.log('Usage: node hash_password.js <your_password>');
  process.exit(1);
}

const saltRounds = 12; // This should match the salt rounds used in your User model

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed Password:', hash);
});
