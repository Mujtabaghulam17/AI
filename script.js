const questions = [
    { 
        text: "Is your data infrastructure quantum-ready?",
        category: "infrastructure"
    },
    { 
        text: "Can your AI adapt to emerging cognitive technologies?",
        category: "adaptability"
    },
    { 
        text: "Do you have ethical AI governance frameworks?",
        category: "governance"
    },
    { 
        text: "Are your AI models capable of cross-domain learning?",
        category: "intelligence"
    }
];

let currentQuestionIndex = 0;
let scores = {
    infrastructure: 0,
    adaptability: 0,
    governance: 0,
    intelligence: 0
};

function answerQuestion(response) {
    const currentQuestion = questions[currentQuestionIndex];
    
    switch(response) {
        case 'yes': scores[currentQuestion.category] += 3; break;
        case 'partial': scores[currentQuestion.category] += 1; break;
        case 'no': scores[currentQuestion.category] += 0; break;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        document.getElementById('question-text').textContent = questions[currentQuestionIndex].text;
    } else {
        showResults();
    }
}

function showResults() {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxPossibleScore = questions.length * 3;
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    let resultDescription;
    if (percentageScore < 40) {
        resultDescription = "Urgent transformation needed. Your AI infrastructure requires comprehensive redesign.";
    } else if (percentageScore < 70) {
        resultDescription = "Emerging potential. Strategic investments can accelerate your AI readiness.";
    } else {
        resultDescription = "Quantum-level preparedness. You're at the forefront of AI innovation.";
    }

    document.getElementById('quiz-container').style.display = 'none';
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    document.getElementById('result-percentage').textContent = `${percentageScore}%`;
    document.getElementById('result-description').textContent = resultDescription;
}

// Quantum-inspired particle canvas
const canvas = document.getElementById('ai-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(0, 180, 255, ${Math.random() * 0.5})`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particlesArray = [];
function init() {
    for (let i = 0; i < 200; i++) {
        particlesArray.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let particle of particlesArray) {
        particle.update();
        particle.draw();
    }
    requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
