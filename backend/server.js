const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
app.use(express.json());
// Redirect root to Homepage.html
app.get('/', (req, res) => {
    console.log("Root path hit, redirecting to Homepage.html");
    res.sendFile(path.join(__dirname, '../frontend/Homepage.html'));
});

app.use(express.static(path.join(__dirname, '../frontend')));

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_oes_key';

// Define Schemas and Models
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' } // 'student' or 'admin'
});
const User = mongoose.model('User', userSchema);

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    option1: { type: String, required: true },
    option2: { type: String, required: true },
    option3: { type: String, required: true },
    option4: { type: String, required: true },
    answer: { type: String, required: true }
});
const Question = mongoose.model('Question', questionSchema);

const resultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percent: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const Result = mongoose.model('Result', resultSchema);

// MongoDB Database connection
if (!process.env.MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in .env file!');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { 
    family: 4,
    serverSelectionTimeoutMS: 30000, // Wait 30s instead of 10s
    socketTimeoutMS: 45000, 
}).then(async () => {
    console.log(`Connected to MongoDB database!`);
    
    // Set buffering to false once connected to prevent future timeouts if connection is stable
    mongoose.set('bufferCommands', false);
    
    // Automatically create an admin user for convenience
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin', 10);
        await User.create({ 
            name: 'System Admin', 
            email: 'admin@gmail.com', 
            mobile: '0000000000', 
            password: hashedPassword, 
            role: 'admin' 
        });
        console.log('Default admin created (admin@gmail.com / admin)');
    }
}).catch((err) => {
    console.error('Error connecting to MongoDB database: ', err.message);
});

// Middleware for JWT Verification
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ msg: "No token provided!" });

    const bearerToken = token.split(' ')[1] || token;

    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ msg: "Unauthorized!" });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// POST /signup
app.post('/signup', async (req, res) => {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
        return res.status(400).json({ msg: "All fields (Name, Email, Mobile, Password) are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, mobile, password: hashedPassword, role: 'student' });
        
        res.json({ msg: "Signup successful! You can now login." });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

// POST /login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: "User not found!" });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ msg: "Invalid password!" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: 86400 }); // 24 hours
        
        res.json({ 
            token: token, 
            role: user.role,
            msg: "Login successful!"
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

// GET /questions (Protected)
app.get('/questions', verifyToken, async (req, res) => {
    try {
        const questions = await Question.find({}, '_id question option1 option2 option3 option4');
        const formattedQuestions = questions.map(q => ({
            id: q._id,
            question: q.question,
            option1: q.option1,
            option2: q.option2,
            option3: q.option3,
            option4: q.option4
        }));
        res.json(formattedQuestions);
    } catch (err) {
        res.status(500).json({ msg: "Failed to load questions", error: err.message });
    }
});

// GET /check-status (Protected)
app.get('/check-status', verifyToken, async (req, res) => {
    try {
        res.json({ completed: false }); // Always allow re-take
    } catch (err) {
        res.status(500).json({ msg: "Error checking status" });
    }
});

// POST /submit (Protected)
app.post('/submit', verifyToken, async (req, res) => {
    const answers = req.body; 

    try {
        const questions = await Question.find({}, '_id answer');
        let score = 0;
        
        questions.forEach(q => {
            if (answers[q._id.toString()] && answers[q._id.toString()] === q.answer) {
                score++;
            }
        });

        const total = questions.length;
        const percent = total > 0 ? ((score / total) * 100).toFixed(2) : "0.00";
        
        // Save result to database
        const newResult = await Result.create({
            user: req.userId,
            score: score,
            total: total,
            percent: percent
        });

        res.json({ score, percent, total, resultId: newResult._id });
    } catch (err) {
        res.status(500).json({ msg: "Failed to submit exam", error: err.message });
    }
});

// POST /admin/add-question (Protected, Admin Only)
app.post('/admin/add-question', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ msg: "Require Admin Role!" });
    }

    const { question, option1, option2, option3, option4, answer } = req.body;

    if (!question || !option1 || !option2 || !option3 || !option4 || !answer) {
        return res.status(400).json({ msg: "All fields are required" });
    }

    try {
        await Question.create({ question, option1, option2, option3, option4, answer });
        res.json({ msg: "Question added successfully!" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

// GET /admin/questions (Protected, Admin Only)
app.get('/admin/questions', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ msg: "Require Admin Role!" });
    }

    try {
        const questions = await Question.find({});
        res.json(questions);
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

// DELETE /admin/questions/:id (Protected, Admin Only)
app.delete('/admin/questions/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ msg: "Require Admin Role!" });
    }

    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ msg: "Question deleted!" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

// PUT /admin/questions/:id (Protected, Admin Only)
app.put('/admin/questions/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ msg: "Require Admin Role!" });
    }

    const { question, option1, option2, option3, option4, answer } = req.body;

    try {
        await Question.findByIdAndUpdate(req.params.id, { question, option1, option2, option3, option4, answer });
        res.json({ msg: "Question updated successfully!" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

// GET /admin/results (Protected, Admin Only)
app.get('/admin/results', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ msg: "Require Admin Role!" });
    }

    try {
        const results = await Result.find().populate('user', 'name email mobile').sort({ date: -1 });
        res.json(results);
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

// DELETE /admin/results/:id (Protected, Admin Only)
app.delete('/admin/results/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ msg: "Require Admin Role!" });
    }

    try {
        await Result.findByIdAndDelete(req.params.id);
        res.json({ msg: "Result record deleted!" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ msg: "Database error", error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});
