const dotenv = require('dotenv');
const result = dotenv.config();

console.log('Dotenv config result:', result);
console.log('MONGODB_URI from process.env:', process.env.MONGODB_URI);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
