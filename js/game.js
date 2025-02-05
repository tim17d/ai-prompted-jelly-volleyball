const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const soundManager = new SoundManager();

class Game {
    constructor() {
        this.player = new JellyBody(200, 300, 30, 8, '#4a9eff');
        this.cpu = new JellyBody(600, 300, 30, 8, '#ff4a4a');
        this.ball = new JellyBody(400, 200, 15, 8, '#ffff4a');

        this.playerScore = 0;
        this.cpuScore = 0;

        this.gravity = 0.8;
        this.ballGravity = 0.5;  // Reduced ball gravity
        this.keys = {};
        this.lastCollisionTime = 0;  // Add collision cooldown timer

        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                soundManager.initialize();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    update() {
        // Player controls and horizontal velocity
        if (this.keys['ArrowLeft']) {
            this.player.vx = -5;
            this.player.x += this.player.vx;
        } else if (this.keys['ArrowRight']) {
            this.player.vx = 5;
            this.player.x += this.player.vx;
        } else {
            this.player.vx = 0;
        }

        if (this.keys[' '] && this.player.onGround) {
            this.player.vy = -15;
            this.player.onGround = false;
        }

        // CPU AI with horizontal velocity
        const dx = this.ball.x - this.cpu.x;
        if (Math.abs(dx) > 10) {
            this.cpu.vx = Math.sign(dx) * 3;
            this.cpu.x += this.cpu.vx;
        } else {
            this.cpu.vx = 0;
        }
        if (this.ball.y < 250 && this.cpu.onGround && this.ball.x > canvas.width/2) {
            this.cpu.vy = -15;
            this.cpu.onGround = false;
        }

        // Apply gravity and update positions
        [this.player, this.cpu].forEach(body => {
            if (!body.onGround) {
                body.vy += this.gravity;
                body.y += body.vy;
            }

            // Ground collision
            if (body.y + body.radius > canvas.height) {
                body.y = canvas.height - body.radius;
                body.vy = 0;
                body.onGround = true;
            }

            // Wall collision
            if (body.x - body.radius < 0) body.x = body.radius;
            if (body.x + body.radius > canvas.width) body.x = canvas.width - body.radius;

            body.update();
        });

        // Ball physics
        if (!this.ball.onGround) {
            this.ball.vy += this.ballGravity;
            this.ball.y += this.ball.vy;
            this.ball.x += this.ball.vx;  // Apply horizontal movement
            this.ball.vx *= 0.99;  // Increased air resistance
        }

        // Ball ground collision
        if (this.ball.y + this.ball.radius > canvas.height) {
            this.ball.y = canvas.height - this.ball.radius;
            this.ball.vy = -this.ball.vy * 0.6;  // Reduced bounce energy
            this.ball.vx *= 0.8;  // Ground friction
            if (Math.abs(this.ball.vy) < 1) {
                this.ball.vy = 0;
                this.ball.onGround = true;
            }
            soundManager.playBounce();
            this.checkScore();
        }

        // Ball wall collision
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx = -this.ball.vx * 0.7;  // Reduced wall bounce
        }
        if (this.ball.x + this.ball.radius > canvas.width) {
            this.ball.x = canvas.width - this.ball.radius;
            this.ball.vx = -this.ball.vx * 0.7;  // Reduced wall bounce
        }

        this.ball.update();

        // Ball collision with players
        const currentTime = Date.now();
        if (currentTime - this.lastCollisionTime > 100) {  // Add collision cooldown
            [this.player, this.cpu].forEach(player => {
                const dx = this.ball.x - player.x;
                const dy = this.ball.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < player.radius + this.ball.radius) {
                    const angle = Math.atan2(dy, dx);
                    const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
                    const playerSpeed = Math.abs(player.vx);  // Get player's horizontal speed

                    // Transfer horizontal momentum from player to ball
                    this.ball.vx = Math.cos(angle) * speed * 1.05 + (player.vx * 0.8);
                    this.ball.vy = Math.sin(angle) * speed * 1.05 - 0.5;  // Keep reduced upward boost
                    this.ball.onGround = false;
                    this.lastCollisionTime = currentTime;  // Update collision timer

                    soundManager.playHit();
                }
            });
        }
    }

    checkScore() {
        if (this.ball.y + this.ball.radius >= canvas.height) {
            if (this.ball.x < canvas.width/2) {
                this.cpuScore++;
            } else {
                this.playerScore++;
            }
            soundManager.playScore();
            document.getElementById('player-score').textContent = this.playerScore;
            document.getElementById('cpu-score').textContent = this.cpuScore;
            this.resetBall();
        }
    }

    resetBall() {
        this.ball.x = canvas.width/2;
        this.ball.y = 100;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw net
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height);
        ctx.lineTo(canvas.width/2, canvas.height - 100);
        ctx.strokeStyle = 'white';
        ctx.stroke();

        this.player.draw(ctx);
        this.cpu.draw(ctx);
        this.ball.draw(ctx);
    }
}

const game = new Game();

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
