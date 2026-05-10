const API = 'http://localhost:3000';

async function test() {
    try {
        console.log("1. Login as Admin...");
        const loginRes = await fetch(API + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        console.log("2. Fetching questions to get an ID...");
        const qRes = await fetch(API + '/admin/questions', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const questions = await qRes.json();
        
        if (questions.length > 0) {
            const id = questions[0]._id;
            console.log("   Found Question ID:", id);

            console.log("\n3. Testing PUT /admin/question/" + id);
            const putRes = await fetch(API + '/admin/question/' + id, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    question: "Updated Question " + Date.now(),
                    option1: "a", option2: "b", option3: "c", option4: "d", answer: "a"
                })
            });
            console.log("   PUT Status:", putRes.status);
            const putData = await putRes.json();
            console.log("   PUT Response:", putData);

            console.log("\n4. Testing DELETE /admin/question/" + id);
            const delRes = await fetch(API + '/admin/question/' + id, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            console.log("   DELETE Status:", delRes.status);
            const delData = await delRes.json();
            console.log("   DELETE Response:", delData);
        } else {
            console.log("No questions to test with.");
        }

    } catch (err) {
        console.error("Test Error:", err);
    }
}

test();
