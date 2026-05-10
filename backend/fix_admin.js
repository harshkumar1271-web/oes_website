require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' }
});
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (admin) {
        console.log(`Admin found: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
        // Check if password is 'admin' plain or hashed
        const isPlain = admin.password === 'admin';
        const isHashed = await bcrypt.compare('admin', admin.password);
        console.log(`Password is 'admin' (plain): ${isPlain}`);
        console.log(`Password is 'admin' (hashed correctly): ${isHashed}`);
        
        if (isPlain) {
            console.log('Password is plain text! Updating to hash...');
            admin.password = await bcrypt.hash('admin', 10);
            await admin.save();
            console.log('Admin password hashed successfully.');
        } else if (!isHashed) {
            console.log('Password does not match "admin". Resetting...');
            admin.password = await bcrypt.hash('admin', 10);
            admin.role = 'admin';
            await admin.save();
            console.log('Admin password reset to "admin".');
        }
    } else {
        console.log('Admin not found. Creating...');
        const hashedPassword = await bcrypt.hash('admin', 10);
        await User.create({ email: 'admin@gmail.com', password: hashedPassword, role: 'admin' });
        console.log('Admin created.');
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
