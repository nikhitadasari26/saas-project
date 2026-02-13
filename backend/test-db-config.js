const config = require('./migration.config.js');
console.log('Loaded Config:', JSON.stringify(config, null, 2));
console.log('Environment:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER
});
