require('dotenv').config();
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: String,
    option1: String,
    option2: String,
    option3: String,
    option4: String,
    answer: String
});
const Question = mongoose.model('Question', questionSchema);

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const count = await Question.countDocuments();
    console.log(`Questions in DB: ${count}`);
    const questions = await Question.find();
    console.log(JSON.stringify(questions, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
