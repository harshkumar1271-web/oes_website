const API = 'http://localhost:3000';

async function test() {
    try {
        const studentEmail = 'student_test_' + Date.now() + '@gmail.com';
        console.log("1. Signing up a new student:", studentEmail);
        await fetch(API + '/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: studentEmail, password: 'password' })
        });

        console.log("2. Logging in...");
        const loginRes = await fetch(API + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: studentEmail, password: 'password' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        console.log("3. Submitting an exam...");
        const submitRes = await fetch(API + '/submit', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({}) // Empty answers is fine
        });
        console.log("   Submit Status:", submitRes.status);

        console.log("\n4. Trying to fetch questions again (should be blocked)...");
        const qRes = await fetch(API + '/questions', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        console.log("   GET /questions Status:", qRes.status);
        const qData = await qRes.json();
        console.log("   Response Data:", qData);

        if (qRes.status === 403 && qData.completed) {
            console.log("\n--- SUCCESS: Duplicate attempt blocked! ---");
        } else {
            console.log("\n--- FAILURE: Duplicate attempt was NOT blocked! ---");
        }

    } catch (err) {
        console.error("Test Error:", err);
    }
}

test();
