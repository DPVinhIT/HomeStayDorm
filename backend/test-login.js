const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin01',
      password: '123456',
      role: 'ADMIN'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testLogin();
