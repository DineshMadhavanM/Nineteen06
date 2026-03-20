const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

function post(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ body: JSON.parse(body), status: res.statusCode }));
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    try {
        const baseUrl = 'http://localhost:3001';
        
        console.log('Logging in...');
        const loginRes = await post(`${baseUrl}/api/auth/login`, {
            email: 'kit27.ad17@gmail.com',
            password: '12345678'
        });
        if (loginRes.status !== 200) throw new Error('Login failed: ' + JSON.stringify(loginRes.body));
        const token = loginRes.body.token;
        console.log('Login successful.');

        console.log('Placing order with coordinates...');
        const orderRes = await post(`${baseUrl}/api/orders`, {
            items: [{ id: 'test', name: 'Test Brownie', price: 100, quantity: 1 }],
            totalAmount: 100,
            address: 'Direct Backend Test Address',
            latitude: 19.0176,
            longitude: 72.8472
        }, { 'x-auth-token': token });
        
        console.log('Response Status:', orderRes.status);
        console.log('Order Body:', JSON.stringify(orderRes.body, null, 2));

        if (orderRes.body.latitude === 19.0176) {
            console.log('SUCCESS: Coordinates saved and returned.');
        } else {
            console.log('FAILURE: Coordinates NOT saved or returned.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err.message);
        process.exit(1);
    }
}

runTest();
