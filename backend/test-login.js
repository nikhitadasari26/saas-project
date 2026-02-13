const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing Health Check...');
        const health = await axios.get('http://localhost:5000/api/health');
        console.log('Health Check Status:', health.status, health.data);
    } catch (err) {
        console.log('Health Check Failed (Expected if server not reloaded):', err.message);
    }

    console.log('\nTesting Login...');
    const loginPayload = {
        email: 'nikhitha@example.com', // I'll need a real email. Assuming seed data or I'll try a common one
        password: 'password123',
        subdomain: 'demo'
    };

    // Try to find a user first or just guess. 
    // Since I don't know the seed data credentials, I'll check the seed file if this fails.

    // Using a likely default for dev environment
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@demo.com', // Often used in seeds
            password: 'Demo@123',
            subdomain: 'demo'
        });

        console.log('Login Success!');
        console.log('Token:', res.data.data.token ? 'Received' : 'Missing');
        console.log('User:', res.data.data.user);

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testLogin();
