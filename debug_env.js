import dotenv from 'dotenv';
dotenv.config();

console.log('USER:', process.env.EMAIL_USER);
console.log('PASS_LENGTH:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('PASS_HAS_SPACES:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.includes(' ') : false);
console.log('PASS_FIRST_CHAR:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS[0] : 'N/A');
console.log('PASS_LAST_CHAR:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS[process.env.EMAIL_PASS.length - 1] : 'N/A');
