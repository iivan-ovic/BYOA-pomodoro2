class PomodoroTimer {
    constructor() {
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.startPauseBtn = document.getElementById('start-pause');
        this.refreshBtn = document.getElementById('refresh');
        this.settingsBtn = document.getElementById('settings');
        this.timerBtns = document.querySelectorAll('.timer-btn');
        this.modal = document.getElementById('settings-modal');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.saveChangesBtn = document.getElementById('save-changes');
        this.resetAllBtn = document.getElementById('reset-all');
        this.pomodoroSequenceToggle = document.getElementById('pomodoro-sequence');
        this.sessionDots = document.querySelectorAll('.dot');
        
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.timerInterval = null;
        this.isRunning = false;
        this.pomodoroCount = 0;
        this.initialTime = 25 * 60; // Store initial time for progress calculation
        
        this.durations = {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15
        };
        
        this.settings = {
            useSequence: false,
            durations: { ...this.durations }
        };
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.updateSessionDots();
    }

    initializeEventListeners() {
        this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.refreshBtn.addEventListener('click', () => this.resetTimer());
        this.settingsBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.saveChangesBtn.addEventListener('click', () => this.saveChanges());
        this.resetAllBtn.addEventListener('click', () => this.resetAll());
        
        // Close modal buttons
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Timer mode buttons
        this.timerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.timerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.timeLeft = parseInt(btn.dataset.time) * 60;
                this.updateDisplay();
                this.resetTimer();
            });
        });
        
        // Settings inputs
        document.getElementById('pomodoro-duration').addEventListener('change', (e) => {
            this.settings.durations.pomodoro = parseInt(e.target.value);
        });
        
        document.getElementById('short-break-duration').addEventListener('change', (e) => {
            this.settings.durations.shortBreak = parseInt(e.target.value);
        });
        
        document.getElementById('long-break-duration').addEventListener('change', (e) => {
            this.settings.durations.longBreak = parseInt(e.target.value);
        });
    }

    updateSessionDots() {
        const activeBtn = document.querySelector('.timer-btn.active');
        const isPomodoro = activeBtn.textContent.trim() === 'Pomodoro';
        
        this.sessionDots.forEach((dot, index) => {
            dot.classList.remove('filled', 'active');
            dot.style.removeProperty('--progress');
            
            if (index < this.pomodoroCount) {
                dot.classList.add('filled');
            }
            // Add active state to current Pomodoro dot
            if (isPomodoro && index === this.pomodoroCount) {
                dot.classList.add('active');
                // Only show progress when timer is running and we have a valid initial time
                if (this.isRunning && this.initialTime > 0) {
                    // Calculate progress as a percentage of time elapsed
                    const timeElapsed = this.initialTime - this.timeLeft;
                    const progress = Math.min((timeElapsed / this.initialTime) * 100, 100);
                    dot.style.setProperty('--progress', `${progress}%`);
                }
            }
        });
    }

    openModal() {
        this.modal.style.display = 'block';
        // Set current values in inputs
        document.getElementById('pomodoro-duration').value = this.durations.pomodoro;
        document.getElementById('short-break-duration').value = this.durations.shortBreak;
        document.getElementById('long-break-duration').value = this.durations.longBreak;
        this.pomodoroSequenceToggle.checked = this.settings.useSequence;
    }

    closeModal() {
        this.modal.style.display = 'none';
        // Reset input values to current settings
        document.getElementById('pomodoro-duration').value = this.durations.pomodoro;
        document.getElementById('short-break-duration').value = this.durations.shortBreak;
        document.getElementById('long-break-duration').value = this.durations.longBreak;
        this.pomodoroSequenceToggle.checked = this.settings.useSequence;
    }

    saveChanges() {
        this.settings.useSequence = this.pomodoroSequenceToggle.checked;
        this.durations = { ...this.settings.durations };
        this.updateTimerButtons();
        this.closeModal();
    }

    resetAll() {
        this.settings = {
            useSequence: false,
            durations: {
                pomodoro: 25,
                shortBreak: 5,
                longBreak: 15
            }
        };
        this.durations = { ...this.settings.durations };
        this.updateTimerButtons();
        this.pomodoroCount = 0;
        this.updateSessionDots();
        this.closeModal();
    }

    updateTimerButtons() {
        this.timerBtns[0].dataset.time = this.durations.pomodoro;
        this.timerBtns[1].dataset.time = this.durations.shortBreak;
        this.timerBtns[2].dataset.time = this.durations.longBreak;
        
        // Update current timer if it's not running
        if (!this.isRunning) {
            const activeBtn = document.querySelector('.timer-btn.active');
            this.timeLeft = parseInt(activeBtn.dataset.time) * 60;
            this.updateDisplay();
        }
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (!this.isRunning) {
            // Set initial time when starting fresh
            const activeBtn = document.querySelector('.timer-btn.active');
            if (this.timeLeft === parseInt(activeBtn.dataset.time) * 60) {
                this.initialTime = this.timeLeft;
            }
        }
        
        this.isRunning = true;
        this.startPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
                this.updateSessionDots(); // Update progress
            } else {
                this.handleTimerComplete();
            }
        }, 1000);
    }

    handleTimerComplete() {
        if (this.settings.useSequence) {
            const activeBtn = document.querySelector('.timer-btn.active');
            const currentMode = activeBtn.textContent.trim();
            
            // Clear the current interval before switching modes
            clearInterval(this.timerInterval);
            this.isRunning = false;
            
            if (currentMode === 'Pomodoro') {
                this.pomodoroCount++;
                this.updateSessionDots();
                this.timerBtns.forEach(b => b.classList.remove('active'));
                
                if (this.pomodoroCount % 4 === 0) {
                    // Switch to long break after 4 pomodoros
                    this.timerBtns[2].classList.add('active');
                    this.timeLeft = this.durations.longBreak * 60;
                    this.initialTime = this.timeLeft;
                    this.pomodoroCount = 0; // Reset count after long break
                    this.updateSessionDots();
                } else {
                    // Switch to short break
                    this.timerBtns[1].classList.add('active');
                    this.timeLeft = this.durations.shortBreak * 60;
                    this.initialTime = this.timeLeft;
                }
            } else {
                // Switch back to pomodoro after any break
                this.timerBtns.forEach(b => b.classList.remove('active'));
                this.timerBtns[0].classList.add('active');
                this.timeLeft = this.durations.pomodoro * 60;
                this.initialTime = this.timeLeft;
            }
            
            this.updateDisplay();
            // Start the new timer after a short delay to ensure smooth transition
            setTimeout(() => {
                this.startTimer();
            }, 100);
        } else {
            this.resetTimer();
        }
    }

    pauseTimer() {
        this.isRunning = false;
        this.startPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.pauseTimer();
        const activeBtn = document.querySelector('.timer-btn.active');
        this.timeLeft = parseInt(activeBtn.dataset.time) * 60;
        this.initialTime = this.timeLeft; // Update initial time
        this.updateDisplay();
        this.updateSessionDots();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 