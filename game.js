// ===========================================
// CLINICAL MASTERY GAME - Main Logic
// ===========================================

class ClinicalGame {
    constructor() {
        this.currentProcedure = null;
        this.steps = [];
        this.selectedSteps = [];
        this.startTime = null;
        this.timerInterval = null;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.checkEmailAndStart();
    }

    cacheElements() {
        // Modals
        this.emailModal = document.getElementById('emailModal');
        this.rulesModal = document.getElementById('rulesModal');
        this.procedureModal = document.getElementById('procedureModal');
        this.attemptsModal = document.getElementById('attemptsModal');
        this.resultModal = document.getElementById('resultModal');
        this.loadingScreen = document.getElementById('loadingScreen');

        // Main container
        this.mainContainer = document.getElementById('mainContainer');

        // Game elements
        this.stepsPool = document.getElementById('stepsPool');
        this.submitBtn = document.getElementById('submitBtn');
        this.timer = document.getElementById('timer');
        this.selectedCount = document.getElementById('selectedCount');
        this.totalCount = document.getElementById('totalCount');
        this.procedureBadge = document.getElementById('procedureBadge');
        this.procedureTitle = document.getElementById('procedureTitle');
        this.procedureDescription = document.getElementById('procedureDescription');

        // Result elements
        this.resultIcon = document.getElementById('resultIcon');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultMessage = document.getElementById('resultMessage');
        this.accuracyValue = document.getElementById('accuracyValue');
        this.timeValue = document.getElementById('timeValue');
        this.attemptsValue = document.getElementById('attemptsValue');
        this.rewardCard = document.getElementById('rewardCard');
        
        // Toast
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Email verification
        document.getElementById('verifyEmailBtn')?.addEventListener('click', () => this.handleEmailVerification());
        document.getElementById('emailInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleEmailVerification();
        });

        // Rules
        document.getElementById('rulesOkayBtn')?.addEventListener('click', () => this.showProcedureSelection());

        // Continue to practice
        document.getElementById('continueToGame')?.addEventListener('click', () => {
            this.attemptsModal.classList.remove('active');
            this.showProcedureSelection();
        });

        // Submit
        this.submitBtn?.addEventListener('click', () => this.checkSequence());

        // Result actions
        document.getElementById('tryAnotherBtn')?.addEventListener('click', () => this.tryAnother());
        document.getElementById('shopNowBtn')?.addEventListener('click', () => this.shopNow());
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyCoupon());
    }

    async checkEmailAndStart() {
        setTimeout(async () => {
            if (window.supabaseHandler?.userEmail) {
                // Email from URL - validate and start
                await this.startGame();
            } else {
                // Show email modal
                this.hideLoading();
                this.showEmailModal();
            }
        }, 1500);
    }

    hideLoading() {
        this.loadingScreen?.classList.add('hidden');
    }

    showEmailModal() {
        this.emailModal?.classList.add('active');
        setTimeout(() => {
            document.getElementById('emailInput')?.focus();
        }, 300);
    }

    async handleEmailVerification() {
        const emailInput = document.getElementById('emailInput');
        const email = emailInput?.value.trim();

        if (!email || !window.supabaseHandler?.isValidEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        window.supabaseHandler.userEmail = email;
        
        this.emailModal?.classList.remove('active');
        this.loadingScreen?.classList.remove('hidden');

        await window.supabaseHandler.validateUser();
        await this.startGame();
    }

    async startGame() {
        this.hideLoading();
        
        // Check attempts
        if (window.supabaseHandler?.hasRewardAttemptsLeft()) {
            this.showRulesModal();
        } else {
            this.showAttemptsExhausted();
        }
    }

    showRulesModal() {
        const attemptsLeft = CONFIG.game.maxRewardAttempts - (window.supabaseHandler?.attemptsUsed || 0);
        document.getElementById('attemptsRemaining').textContent = attemptsLeft;
        this.rulesModal?.classList.add('active');
    }

    showAttemptsExhausted() {
        // Show previous rewards
        const prevRewards = window.supabaseHandler?.getPreviousRewards() || [];
        const display = document.getElementById('previousRewardsDisplay');
        
        if (display) {
            if (prevRewards.length > 0) {
                display.innerHTML = prevRewards.map(r => `
                    <div class="prev-reward-item">
                        <strong>${r.title}</strong>
                        <code>${r.code}</code>
                        <span>${r.accuracy}% accuracy</span>
                    </div>
                `).join('');
            } else {
                display.innerHTML = '<p>No rewards earned yet. Keep practicing!</p>';
            }
        }

        this.attemptsModal?.classList.add('active');
    }

    showProcedureSelection() {
        this.rulesModal?.classList.remove('active');
        this.attemptsModal?.classList.remove('active');
        
        // Load procedures
        const grid = document.getElementById('procedureGrid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.values(CONFIG.procedures).forEach(proc => {
            const card = document.createElement('div');
            card.className = 'specialty-card';
            card.innerHTML = `
                <div class="card-glow"></div>
                <div class="card-content">
                    <div class="specialty-icon-wrapper">
                        <div class="specialty-icon">${proc.icon}</div>
                    </div>
                    <h3>${proc.title}</h3>
                    <p>${proc.steps.length} steps · ${proc.difficulty}</p>
                    <div class="card-arrow">→</div>
                </div>
            `;
            card.addEventListener('click', () => this.loadProcedure(proc.id));
            grid.appendChild(card);
        });

        this.procedureModal?.classList.add('active');
    }

    loadProcedure(procedureId) {
        this.currentProcedure = CONFIG.procedures[procedureId];
        
        if (!this.currentProcedure) {
            console.error('Procedure not found:', procedureId);
            return;
        }

        // Close modal
        this.procedureModal?.classList.remove('active');

        // Show countdown
        this.showCountdown();
    }

    showCountdown() {
        const overlay = document.getElementById('countdownOverlay');
        const numberEl = document.getElementById('countdownNumber');
        
        if (!overlay || !numberEl) {
            this.startProcedure();
            return;
        }

        overlay.classList.add('active');
        let count = 3;

        const interval = setInterval(() => {
            if (count === 0) {
                numberEl.textContent = 'GO!';
                if (window.gsap) {
                    gsap.to(numberEl, {
                        scale: 1.5,
                        duration: 0.3,
                        onComplete: () => {
                            setTimeout(() => {
                                overlay.classList.remove('active');
                                this.startProcedure();
                            }, 400);
                        }
                    });
                } else {
                    setTimeout(() => {
                        overlay.classList.remove('active');
                        this.startProcedure();
                    }, 400);
                }
                clearInterval(interval);
            } else {
                numberEl.textContent = count;
                if (window.gsap) {
                    gsap.fromTo(numberEl,
                        { scale: 0, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
                    );
                }
                count--;
            }
        }, 1000);
    }

    startProcedure() {
        // Setup UI
        this.mainContainer?.classList.remove('hidden');
        this.procedureBadge.textContent = this.currentProcedure.icon + ' ' + this.currentProcedure.title.split(' ').slice(0, 2).join(' ');
        this.procedureTitle.textContent = this.currentProcedure.title;
        this.procedureDescription.textContent = this.currentProcedure.description;

        // Shuffle and display steps
        this.steps = this.shuffleArray([...this.currentProcedure.steps]);
        this.selectedSteps = [];
        this.renderSteps();

        // Start timer
        this.startTime = Date.now();
        this.startTimer();

        // Reset submit button
        this.submitBtn.disabled = true;
        this.updateCounter();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderSteps() {
        if (!this.stepsPool) return;

        this.stepsPool.innerHTML = '';
        this.totalCount.textContent = this.steps.length;

        this.steps.forEach(step => {
            const stepEl = document.createElement('div');
            stepEl.className = 'step-item-click';
            stepEl.dataset.stepId = step.id;
            stepEl.dataset.correctOrder = step.order;
            
            stepEl.innerHTML = `
                <div class="step-selection-number">?</div>
                <div class="step-text-click">${step.text}</div>
            `;

            stepEl.addEventListener('click', () => this.toggleStep(stepEl, step));
            this.stepsPool.appendChild(stepEl);
        });
    }

    toggleStep(element, step) {
        const isSelected = element.classList.contains('selected');

        if (isSelected) {
            // Deselect
            const index = this.selectedSteps.findIndex(s => s.id === step.id);
            if (index > -1) {
                this.selectedSteps.splice(index, 1);
            }
            element.classList.remove('selected');
            this.reindexSteps();
        } else {
            // Select
            this.selectedSteps.push(step);
            element.classList.add('selected');
            const numberEl = element.querySelector('.step-selection-number');
            numberEl.textContent = this.selectedSteps.length;

            // Animation
            if (window.gsap) {
                gsap.fromTo(element,
                    { scale: 0.95 },
                    { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
                );
            }
        }

        this.updateCounter();
        this.checkSubmitEnabled();
    }

    reindexSteps() {
        // Update numbers after deselection
        const allSteps = Array.from(document.querySelectorAll('.step-item-click'));
        allSteps.forEach(el => {
            const stepId = parseInt(el.dataset.stepId);
            const index = this.selectedSteps.findIndex(s => s.id === stepId);
            const numberEl = el.querySelector('.step-selection-number');
            
            if (index > -1) {
                numberEl.textContent = index + 1;
            } else {
                numberEl.textContent = '?';
            }
        });
    }

    updateCounter() {
        this.selectedCount.textContent = this.selectedSteps.length;
    }

    checkSubmitEnabled() {
        const allSelected = this.selectedSteps.length === this.steps.length;
        this.submitBtn.disabled = !allSelected;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    checkSequence() {
        this.stopTimer();
        
        // Calculate accuracy
        let correctCount = 0;
        this.selectedSteps.forEach((step, index) => {
            if (step.order === index + 1) {
                correctCount++;
            }
        });

        const accuracy = Math.round((correctCount / this.steps.length) * 100);
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        const isPerfect = accuracy === 100;

        // Get reward
        const reward = window.supabaseHandler?.getRewardForAccuracy(accuracy) || CONFIG.rewardTiers[CONFIG.rewardTiers.length - 1];

        // Submit to Supabase
        const attemptData = {
            procedureId: this.currentProcedure.id,
            procedureName: this.currentProcedure.title,
            accuracy,
            timeTaken,
            isPerfect,
            rewardTitle: reward.title,
            couponCode: reward.coupon_code
        };

        window.supabaseHandler?.submitAttempt(attemptData);

        // Show result
        this.showResult(accuracy, timeTaken, reward, isPerfect);
    }

    showResult(accuracy, timeTaken, reward, isPerfect) {
        // Update result UI
        if (isPerfect) {
            this.resultTitle.textContent = '🎉 Perfect Sequence!';
            this.resultMessage.textContent = 'You\'ve mastered this clinical protocol!';
            this.resultIcon.innerHTML = `
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
        } else if (accuracy >= 80) {
            this.resultTitle.textContent = '⭐ Excellent Work!';
            this.resultMessage.textContent = 'Great job! Small room for improvement.';
        } else if (accuracy >= 60) {
            this.resultTitle.textContent = '👍 Good Effort!';
            this.resultMessage.textContent = 'Not bad! Keep practicing.';
        } else {
            this.resultTitle.textContent = '📚 Keep Learning!';
            this.resultMessage.textContent = 'Review the procedure and try again.';
        }

        // Stats
        this.accuracyValue.textContent = `${accuracy}%`;
        this.timeValue.textContent = this.formatTime(timeTaken);
        this.attemptsValue.textContent = `${window.supabaseHandler?.attemptsUsed || 0}/${CONFIG.game.maxRewardAttempts}`;

        // Reward card (only if not practice mode and has actual reward)
        if (reward.priority > 0 && window.supabaseHandler?.hasRewardAttemptsLeft()) {
            this.rewardCard.style.display = 'block';
            document.getElementById('rewardTitle').textContent = reward.title;
            document.getElementById('rewardDescription').textContent = reward.description;
            document.getElementById('couponCode').textContent = reward.coupon_code;
            
            const rewardImg = document.getElementById('rewardImage');
            if (reward.image_url) {
                rewardImg.src = reward.image_url;
                rewardImg.style.display = 'block';
            } else {
                rewardImg.style.display = 'none';
            }
        } else {
            this.rewardCard.style.display = 'none';
        }

        // Show modal
        this.resultModal?.classList.add('active');

        // Confetti for perfect score
        if (isPerfect && window.gsap) {
            this.showConfetti();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    }

    showConfetti() {
        // Simple confetti effect
        const colors = ['#00A8E8', '#2EC4B6', '#06D6A0', '#FFB627'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            document.body.appendChild(confetti);

            gsap.to(confetti, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 400,
                rotation: Math.random() * 720,
                opacity: 0,
                duration: 2 + Math.random(),
                ease: 'power1.out',
                onComplete: () => confetti.remove()
            });
        }
    }

    tryAnother() {
        this.resultModal?.classList.remove('active');
        this.mainContainer?.classList.add('hidden');
        this.showProcedureSelection();
    }

    shopNow() {
        window.open(CONFIG.urls.shopNow, '_blank');
    }

    copyCoupon() {
        const code = document.getElementById('couponCode')?.textContent;
        if (code) {
            navigator.clipboard.writeText(code);
            this.showToast('Coupon code copied! 🎉');
        }
    }

    showToast(message, type = 'success') {
        if (!this.toast) return;

        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.clinicalGame = new ClinicalGame();
});
