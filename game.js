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
        // Containers
        this.dashboardContainer = document.getElementById('dashboardContainer');
        this.mainContainer = document.getElementById('mainContainer');
        this.loadingScreen = document.getElementById('loadingScreen');

        // Modals
        this.emailModal = document.getElementById('emailModal');
        this.procedureModal = document.getElementById('procedureModal');
        this.resultModal = document.getElementById('resultModal');
        this.leaderboardModal = document.getElementById('leaderboardModal');

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

        // Dashboard actions
        document.getElementById('startGameBtn')?.addEventListener('click', () => this.showProcedureSelection());
        document.getElementById('shopNowDashBtn')?.addEventListener('click', () => this.shopNow());
        document.getElementById('viewFullLeaderboardBtn')?.addEventListener('click', () => this.showFullLeaderboard());

        // Procedure modal
        document.getElementById('backToDashboardBtn')?.addEventListener('click', () => this.backToDashboard());

        // Submit
        this.submitBtn?.addEventListener('click', () => this.checkSequence());

        // Result actions
        document.getElementById('tryAnotherBtn')?.addEventListener('click', () => this.tryAnother());
        document.getElementById('backHomeBtn')?.addEventListener('click', () => this.backToDashboard());
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyCoupon());

        // Floating buttons
        document.getElementById('floatingHomeBtn')?.addEventListener('click', () => this.backToDashboard());

        // Leaderboard
        document.getElementById('closeLeaderboardBtn')?.addEventListener('click', () => this.closeLeaderboard());
    }

    async checkEmailAndStart() {
        const loadingSubtitle = document.querySelector('.loading-subtitle');
        if (loadingSubtitle && window.supabaseHandler) {
            loadingSubtitle.textContent = window.supabaseHandler.getRandomMessage('loading');
        }

        setTimeout(async () => {
            if (window.supabaseHandler?.userEmail) {
                await this.startGame();
            } else {
                this.hideLoading();
                setTimeout(() => this.showEmailModal(), 300);
            }
        }, 1500);
    }

    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.classList.add('hidden');
                this.loadingScreen.style.display = 'none';
            }, 400);
        }
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
        this.loadingScreen.style.display = 'flex';
        this.loadingScreen.style.opacity = '1';

        await window.supabaseHandler.validateUser();
        await this.startGame();
    }

    async startGame() {
        this.hideLoading();
        await this.showDashboard();
    }

    async showDashboard() {
        // Update welcome message
        const welcomeEl = document.getElementById('dashboardWelcome');
        const subtitleEl = document.getElementById('dashboardSubtitle');
        const userEmailBadge = document.getElementById('userEmailBadge');

        if (window.supabaseHandler) {
            const name = window.supabaseHandler.userDisplayName || 'Doctor';
            const message = window.supabaseHandler.getRandomMessage('welcome');
            
            if (welcomeEl) welcomeEl.textContent = `${message}`;
            if (subtitleEl) subtitleEl.innerHTML = `<strong>${name}</strong>, ready to master another procedure?`;
            if (userEmailBadge) userEmailBadge.textContent = window.supabaseHandler.userEmail;

            // Update attempts display
            const attemptsLeft = CONFIG.game.maxRewardAttempts - window.supabaseHandler.attemptsUsed;
            const attemptsCircle = document.getElementById('attemptsLeftCircle');
            const attemptsStatus = document.getElementById('attemptsStatus');
            
            if (attemptsCircle) attemptsCircle.textContent = attemptsLeft;
            if (attemptsStatus) {
                if (attemptsLeft > 0) {
                    attemptsStatus.textContent = 'Available';
                    attemptsStatus.style.color = 'var(--success)';
                } else {
                    attemptsStatus.textContent = 'Practice Mode';
                    attemptsStatus.style.color = 'var(--warning)';
                }
            }
        }

        // Load dashboard data
        await this.loadDashboardData();

        // Show dashboard
        this.dashboardContainer?.classList.remove('hidden');
        this.mainContainer?.classList.add('hidden');
    }

    async loadDashboardData() {
        // Load user's rewards
        await this.loadMyRewards();

        // Load leaderboard
        await this.loadDashboardLeaderboard();

        // Load game history
        await this.loadMyHistory();
    }

    async loadMyRewards() {
        const container = document.getElementById('myRewardsList');
        const countEl = document.getElementById('rewardCount');

        if (!container || !window.supabaseHandler) return;

        try {
            const { data, error } = await window.supabaseHandler.client
                .from('clinical_attempts')
                .select('*')
                .eq('user_id', window.supabaseHandler.userId)
                .eq('is_practice', false)
                .not('coupon_code', 'eq', 'PRACTICE')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const rewards = data || [];
            
            if (countEl) countEl.textContent = `${rewards.length} reward${rewards.length !== 1 ? 's' : ''}`;

            if (rewards.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>🎯 Play games to earn exclusive rewards!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = rewards.map(reward => `
                <div class="reward-item glass-card">
                    <div class="reward-item-icon">🎁</div>
                    <div class="reward-item-info">
                        <h4>${reward.reward_title || 'Reward'}</h4>
                        <p>${reward.procedure_name} · ${reward.accuracy}% accuracy</p>
                        <small>${this.formatDate(reward.created_at)}</small>
                    </div>
                    <div class="reward-item-coupon">
                        <code class="coupon-display">${reward.coupon_code}</code>
                        <button class="copy-coupon-btn" onclick="window.clinicalGame.copyCouponCode('${reward.coupon_code}')" title="Copy code">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (err) {
            console.error('Load rewards error:', err);
            container.innerHTML = '<div class="empty-state"><p>Error loading rewards</p></div>';
        }
    }

    async loadDashboardLeaderboard() {
        const container = document.getElementById('dashboardLeaderboard');
        if (!container || !window.supabaseHandler) return;

        const topPlayers = window.supabaseHandler.getTopPlayers(5);

        if (topPlayers.length === 0) {
            container.innerHTML = '<p class="no-leaders">🏆 Be the first legend!</p>';
            return;
        }

        container.innerHTML = topPlayers.map((player, index) => {
            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
            return `
                <div class="leader-row ${index === 0 ? 'top-leader' : ''}">
                    <div class="leader-rank">${medals[index]}</div>
                    <div class="leader-info">
                        <div class="leader-name">${player.name}</div>
                        <div class="leader-stats">${player.accuracy}% · ${player.games} games</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadMyHistory() {
        const container = document.getElementById('myHistoryList');
        const countEl = document.getElementById('historyCount');

        if (!container || !window.supabaseHandler) return;

        try {
            const { data, error } = await window.supabaseHandler.client
                .from('clinical_attempts')
                .select('*')
                .eq('user_id', window.supabaseHandler.userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            const history = data || [];
            
            if (countEl) countEl.textContent = `${history.length} game${history.length !== 1 ? 's' : ''}`;

            if (history.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No games played yet. Start your first challenge! 🚀</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = history.map(game => {
                const isPerfect = game.is_perfect;
                const isPractice = game.is_practice;
                const emoji = isPerfect ? '🎉' : game.accuracy >= 80 ? '⭐' : '📚';
                
                return `
                    <div class="history-item glass-card">
                        <div class="history-icon">${emoji}</div>
                        <div class="history-info">
                            <h4>${game.procedure_name}</h4>
                            <p>${game.accuracy}% accuracy · ${this.formatTime(game.time_taken)}</p>
                            <small>${this.formatDate(game.created_at)} ${isPractice ? '· Practice' : ''}</small>
                        </div>
                        <div class="history-badge ${isPerfect ? 'perfect' : game.accuracy >= 80 ? 'good' : 'practice'}">
                            ${game.accuracy}%
                        </div>
                    </div>
                `;
            }).join('');

        } catch (err) {
            console.error('Load history error:', err);
            container.innerHTML = '<div class="empty-state"><p>Error loading history</p></div>';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    copyCouponCode(code) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code);
            this.showToast(`Coupon ${code} copied! 🎉`);
        }
    }

    showFullLeaderboard() {
        const modal = this.leaderboardModal;
        if (!modal || !window.supabaseHandler) return;

        const container = document.getElementById('leaderboardList');
        const allPlayers = window.supabaseHandler.leaderboard;

        if (allPlayers.length === 0) {
            container.innerHTML = '<p class="no-data">No players yet. Be the first! 🚀</p>';
        } else {
            container.innerHTML = allPlayers.map(player => `
                <div class="leaderboard-row">
                    <div class="lb-rank">#${player.rank}</div>
                    <div class="lb-name">${player.name}</div>
                    <div class="lb-stats">
                        <span class="lb-accuracy">${player.accuracy}%</span>
                        <span class="lb-games">${player.games} games</span>
                    </div>
                </div>
            `).join('');
        }

        modal.classList.add('active');
    }

    closeLeaderboard() {
        this.leaderboardModal?.classList.remove('active');
    }

    backToDashboard() {
        this.procedureModal?.classList.remove('active');
        this.resultModal?.classList.remove('active');
        this.mainContainer?.classList.add('hidden');
        
        // Reload dashboard data
        this.loadDashboardData();
        
        this.dashboardContainer?.classList.remove('hidden');
    }

    showProcedureSelection() {
        this.dashboardContainer?.classList.add('hidden');
        
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

        this.procedureModal?.classList.remove('active');
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
        this.mainContainer?.classList.remove('hidden');
        this.procedureBadge.textContent = this.currentProcedure.icon + ' ' + this.currentProcedure.title;
        this.procedureTitle.textContent = this.currentProcedure.title;
        this.procedureDescription.textContent = this.currentProcedure.description;

        this.steps = this.shuffleArray([...this.currentProcedure.steps]);
        this.selectedSteps = [];
        this.renderSteps();

        this.startTime = Date.now();
        this.startTimer();

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
            const index = this.selectedSteps.findIndex(s => s.id === step.id);
            if (index > -1) {
                this.selectedSteps.splice(index, 1);
            }
            element.classList.remove('selected');
            this.reindexSteps();
        } else {
            this.selectedSteps.push(step);
            element.classList.add('selected');
            const numberEl = element.querySelector('.step-selection-number');
            numberEl.textContent = this.selectedSteps.length;

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
        
        let correctCount = 0;
        this.selectedSteps.forEach((step, index) => {
            if (step.order === index + 1) {
                correctCount++;
            }
        });

        const accuracy = Math.round((correctCount / this.steps.length) * 100);
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        const isPerfect = accuracy === 100;

        const reward = window.supabaseHandler?.getRewardForAccuracy(accuracy) || CONFIG.rewardTiers[CONFIG.rewardTiers.length - 1];

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
        this.showResult(accuracy, timeTaken, reward, isPerfect);
    }

    showResult(accuracy, timeTaken, reward, isPerfect) {
        let messageType = 'needsPractice';
        if (isPerfect) {
            messageType = 'perfect';
        } else if (accuracy >= 70) {
            messageType = 'good';
        }

        const quirkMessage = window.supabaseHandler?.getRandomMessage(messageType) || '';

        if (isPerfect) {
            this.resultTitle.textContent = '🎉 Perfect Sequence!';
            this.resultMessage.textContent = quirkMessage;
            this.resultIcon.innerHTML = `
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
        } else if (accuracy >= 80) {
            this.resultTitle.textContent = '⭐ Excellent Work!';
            this.resultMessage.textContent = quirkMessage;
        } else if (accuracy >= 60) {
            this.resultTitle.textContent = '👍 Good Effort!';
            this.resultMessage.textContent = quirkMessage;
        } else {
            this.resultTitle.textContent = '📚 Keep Learning!';
            this.resultMessage.textContent = quirkMessage;
        }

        this.accuracyValue.textContent = `${accuracy}%`;
        this.timeValue.textContent = this.formatTime(timeTaken);
        this.attemptsValue.textContent = `${window.supabaseHandler?.attemptsUsed || 0}/${CONFIG.game.maxRewardAttempts}`;

        const isPracticeMode = !window.supabaseHandler?.hasRewardAttemptsLeft();
        if (reward.priority > 0 && !isPracticeMode) {
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

        this.resultModal?.classList.add('active');

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
        
        window.supabaseHandler?.loadLeaderboard();
        
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

document.addEventListener('DOMContentLoaded', () => {
    window.clinicalGame = new ClinicalGame();
});
