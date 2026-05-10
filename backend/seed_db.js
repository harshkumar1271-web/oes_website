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

const sampleQuestions = [
    {
        question: "What does HTML stand for?",
        option1: "Hyperlinks and Text Markup Language",
        option2: "Hyper Text Markup Language",
        option3: "Home Tool Markup Language",
        option4: "Hyper Text Main Language",
        answer: "Hyper Text Markup Language"
    },
    {
        question: "Which language is used for web styling?",
        option1: "PHP",
        option2: "Python",
        option3: "CSS",
        option4: "JavaScript"
        ,answer: "CSS"
    },
    {
        question: "What is the correct way to write a JavaScript array?",
        option1: "var colors = 1 = (\"red\"), 2 = (\"green\")",
        option2: "var colors = [\"red\", \"green\", \"blue\"]",
        option3: "var colors = (1:\"red\", 2:\"green\")",
        option4: "var colors = \"red\", \"green\", \"blue\"",
        answer: "var colors = [\"red\", \"green\", \"blue\"]"
    }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await Question.deleteMany({}); // Optional: clear existing
    await Question.insertMany(sampleQuestions);
    console.log(`Sample questions seeded!`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
