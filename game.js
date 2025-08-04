class SimonGame {
    constructor() {
        this.gamePattern = [];
        this.userPattern = [];
        this.level = 0;
        this.started = false;
        this.strict = false;
        this.gameSpeed = 1000;
        this.colors = ['green', 'red', 'yellow', 'blue'];
        this.sounds = {};
        this.isPlaying = false;

        this.initializeElements();
        this.initializeSounds();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.levelTitle = document.getElementById('level-title');
        this.scoreDisplay = document.getElementById('score');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.colorButtons = document.querySelectorAll('.color-button');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
    }

    initializeSounds() {
        // Create audio objects for each color and wrong sound
        this.colors.forEach(color => {
            this.sounds[color] = new Audio(`sounds/${color}.mp3`);
            this.sounds[color].preload = 'auto';
            this.sounds[color].volume = 0.7;
        });
        this.sounds.wrong = new Audio('sounds/wrong.mp3');
        this.sounds.wrong.preload = 'auto';
        this.sounds.wrong.volume = 0.8;
    }

    bindEvents() {
        // Start button
        this.startBtn.addEventListener('click', () => this.startGame());

        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetGame());

        // Color buttons
        this.colorButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleColorClick(e.target.id));

            // Touch events for better mobile support
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleColorClick(e.target.id);
            });
        });

        // Difficulty buttons
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setDifficulty(e.target));
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.started) {
                e.preventDefault();
                this.startGame();
            }
        });
    }

    setDifficulty(target) {
        this.difficultyBtns.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        this.gameSpeed = parseInt(target.dataset.speed);
    }

    startGame() {
        if (this.started) return;

        this.started = true;
        this.level = 0;
        this.gamePattern = [];
        this.userPattern = [];
        this.levelTitle.textContent = 'GET READY...';
        this.startBtn.textContent = 'PLAYING...';
        this.startBtn.style.opacity = '0.6';

        setTimeout(() => {
            this.nextSequence();
        }, 1000);
    }

    nextSequence() {
        this.userPattern = [];
        this.level++;
        this.updateDisplay();

        // Add random color to pattern
        const randomColor = this.colors[Math.floor(Math.random() * 4)];
        this.gamePattern.push(randomColor);

        // Play the sequence
        this.playSequence();
    }

    async playSequence() {
        this.isPlaying = true;
        this.levelTitle.textContent = 'WATCH...';

        for (let i = 0; i < this.gamePattern.length; i++) {
            await this.wait(this.gameSpeed / 2);
            await this.activateColor(this.gamePattern[i]);
            await this.wait(this.gameSpeed / 4);
        }

        this.isPlaying = false;
        this.levelTitle.textContent = 'YOUR TURN';
    }

    async activateColor(color) {
        const button = document.getElementById(color);
        button.classList.add('active');
        this.playSound(color);

        await this.wait(this.gameSpeed / 2);
        button.classList.remove('active');
    }

    handleColorClick(color) {
        if (!this.started || this.isPlaying) return;

        this.userPattern.push(color);
        this.pressColor(color);
        this.playSound(color);

        this.checkAnswer(this.userPattern.length - 1);
    }

    pressColor(color) {
        const button = document.getElementById(color);
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }

    checkAnswer(currentLevel) {
        if (this.userPattern[currentLevel] === this.gamePattern[currentLevel]) {
            if (this.userPattern.length === this.gamePattern.length) {
                // User completed the sequence correctly
                this.levelTitle.textContent = 'CORRECT!';
                setTimeout(() => {
                    this.nextSequence();
                }, 1000);
            }
        } else {
            // Wrong answer
            this.gameOver();
        }
    }

    gameOver() {
        this.levelTitle.textContent = 'GAME OVER!';
        this.playSound('wrong');
        document.body.classList.add('game-over');

        setTimeout(() => {
            document.body.classList.remove('game-over');
        }, 1000);

        setTimeout(() => {
            this.resetGame();
        }, 2000);
    }

    resetGame() {
        this.started = false;
        this.level = 0;
        this.gamePattern = [];
        this.userPattern = [];
        this.isPlaying = false;
        this.levelTitle.textContent = 'SIMON SAYS';
        this.startBtn.textContent = 'START GAME';
        this.startBtn.style.opacity = '1';
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.started && this.level > 0) {
            this.scoreDisplay.textContent = `LEVEL ${this.level}`;
        } else {
            this.scoreDisplay.textContent = 'READY';
        }
    }

    playSound(name) {
        try {
            if (this.sounds[name]) {
                this.sounds[name].currentTime = 0;
                this.sounds[name].play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (e) {
            console.log('Sound not available:', name);
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SimonGame();
});

// Handle visibility change to pause audio
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause all audio when tab is not visible
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
        });
    }
});