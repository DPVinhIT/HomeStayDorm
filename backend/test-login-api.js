async function testLogin() {
  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'sale01',
        password: 'Password@123',
        role: 'SALE'
      })
    });
    
    const data = await res.text();
    console.log('Status:', res.status);
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLogin();
