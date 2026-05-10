const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, default: 'N/A' },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, default: '0000000000' },
    password: { type: String, required: true },
    role: { type: String, default: 'student' }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI, { family: 4 }).then(async () => {
    console.log("Connected to DB.");
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    
    for (const user of users) {
        console.log(`Checking user: ${user.email} | Name: ${user.name} | Mobile: ${user.mobile}`);
        let updated = false;
        if (!user.name || user.name === 'undefined' || user.name === '') {
            user.name = user.role === 'admin' ? 'System Admin' : 'Student';
            updated = true;
        }
        if (!user.mobile || user.mobile === 'undefined' || user.mobile === '') {
            user.mobile = '0000000000';
            updated = true;
        }
        
        if (updated) {
            await user.save();
            console.log(`-> UPDATED: ${user.email}`);
        }
    }
    
    console.log("Done.");
    process.exit(0);
}).catch(err => {
    console.error("Failed:", err);
    process.exit(1);
});
