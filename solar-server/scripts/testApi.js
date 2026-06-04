const axios = require('axios');

async function testApi() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: '8511231513',
            password: '8511231513'
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testApi();
