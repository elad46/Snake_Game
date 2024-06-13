const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scale = 20;
canvas.width = 400;
canvas.height = 400;
const rows = canvas.height / scale;
const columns = canvas.width / scale;
let snake;
let fruit;
let speed = 250;
let interval;
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;

document.getElementById('highScoreValue').textContent = highscore;
document.getElementById('speed').addEventListener('input', function() {
    speed = this.value;
    clearInterval(interval);
    interval = window.setInterval(gameLoop, speed);
});

document.getElementById('startGame').addEventListener('click', startGame);

function startGame() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    setup();
}

function setup() {
    snake = new Snake();
    fruit = new Fruit();
    fruit.pickLocation();
    score = 0;
    document.getElementById('score').textContent = score;
    interval = window.setInterval(gameLoop, speed);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fruit.draw();
    snake.update();
    snake.draw();
    updateParticles();

    if (snake.eat(fruit)) {
        createParticles(fruit.x, fruit.y, fruit.color);
        fruit.pickLocation();
        score++;
        document.getElementById('score').textContent = score;
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('highscore', highscore);
            document.getElementById('highScoreValue').textContent = highscore;
        }
    }

    snake.checkCollision();
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        const particle = new Particle(x, y, color);
        particles.push(particle);
    }
}

let particles = [];

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
        }
    }
}

function Particle(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.speedX = (Math.random() * 2 - 1) * 8;
    this.speedY = (Math.random() * 2 - 1) * 8;
    this.color = color;
    this.opacity = 1;

    this.draw = function() {
        ctx.fillStyle = `rgba(${parseInt(this.color.slice(1, 3), 16)}, ${parseInt(this.color.slice(3, 5), 16)}, ${parseInt(this.color.slice(5, 7), 16)}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        this.update();
    }

    this.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.95;
        this.opacity -= 0.05;
    }
}

function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = scale * 1;
    this.ySpeed = 0;
    this.total = 0;
    this.tail = [];

    this.draw = function() {
        ctx.fillStyle = "#FFFFFF";

        for (let i = 0; i < this.tail.length; i++) {
            ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
        }

        ctx.fillRect(this.x, this.y, scale, scale);
    }

    this.update = function() {
        for (let i = 0; i < this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1];
        }

        this.tail[this.total - 1] = { x: this.x, y: this.y };

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.x >= canvas.width) {
            this.x = 0;
        }

        if (this.y >= canvas.height) {
            this.y = 0;
        }

        if (this.x < 0) {
            this.x = canvas.width - scale;
        }

        if (this.y < 0) {
            this.y = canvas.height - scale;
        }
    }

    this.changeDirection = function(direction) {
        switch (direction) {
            case 'Up':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = -scale * 1;
                }
                break;
            case 'Down':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = scale * 1;
                }
                break;
            case 'Left':
                if (this.xSpeed === 0) {
                    this.xSpeed = -scale * 1;
                    this.ySpeed = 0;
                }
                break;
            case 'Right':
                if (this.xSpeed === 0) {
                    this.xSpeed = scale * 1;
                    this.ySpeed = 0;
                }
                break;
        }
    }

    this.eat = function(fruit) {
        if (this.x === fruit.x && this.y === fruit.y) {
            this.total++;
            return true;
        }

        return false;
    }

    this.checkCollision = function() {
        for (let i = 0; i < this.tail.length; i++) {
            if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                this.total = 0;
                this.tail = [];
                score = 0;
                document.getElementById('score').textContent = score;
            }
        }
    }
}

function Fruit() {
    this.x;
    this.y;
    this.color;

    this.pickLocation = function() {
        this.x = Math.floor(Math.random() * rows) * scale;
        this.y = Math.floor(Math.random() * columns) * scale;
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16); // צבע אקראי
    }

    this.draw = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, scale, scale);
    }
}

window.addEventListener('keydown', (evt) => {
    const direction = evt.key.replace('Arrow', '');
    snake.changeDirection(direction);
});
