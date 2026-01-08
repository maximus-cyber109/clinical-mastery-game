// ===========================================
// SUPABASE HANDLER - Database + Leaderboard
// ===========================================

class SupabaseHandler {
    constructor() {
        this.client = null;
        this.userEmail = null;
        this.userName = null;
        this.userDisplayName = null;
        this.userId = null;
        this.attemptsUsed = 0;
        this.isValidated = false;
        this.rewards = [];
        this.previousAttempts = [];
        this.leaderboard = [];
        this.init();
    }

    async init() {
        try {
            if (!window.supabase) {
                console.error('❌ Supabase CDN not loaded');
                return;
            }

            this.client = window.supabase.createClient(
                CONFIG.supabase.url,
                CONFIG.supabase.key
            );

            console.log('✅ Supabase client initialized');

            const urlParams = new URLSearchParams(window.location.search);
            const emailParam = urlParams.get('email');

            if (emailParam && this.isValidEmail(emailParam)) {
                this.userEmail = emailParam;
                await this.validateUser();
            }

            await this.loadRewards();
            await this.loadLeaderboard();
        } catch (err) {
            console.error('Supabase init error:', err);
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async validateUser() {
        if (!this.client || !this.userEmail) return false;

        try {
            // Check if user exists in Supabase
            const { data: userData, error: userError } = await this.client
                .from('clinical_users')
                .select('*')
                .eq('email', this.userEmail)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                throw userError;
            }

            if (userData) {
                // User exists - load from database
                console.log('✅ User found in database:', userData.email);
                this.userId = userData.id;
                this.userName = userData.name || this.userEmail.split('@')[0];
                this.userDisplayName = userData.display_name || this.formatDoctorName(this.userName);
                this.attemptsUsed = userData.attempts_used || 0;
                await this.loadUserAttempts();
            } else {
                // New user - fetch from Magento first
                console.log('🔍 New user, fetching from Magento...');
                await this.validateWithMagento();
                await this.createUser();
            }

            this.isValidated = true;
            return true;
        } catch (err) {
            console.error('User validation error:', err);
            return false;
        }
    }

    formatDoctorName(name) {
        if (!name) return 'Dr. Champion';
        
        // Check if name already starts with Dr., Dr, DR, or similar
        const hasPrefix = /^(dr\.?|doctor)\s+/i.test(name.trim());
        
        if (hasPrefix) {
            // Clean up the existing prefix
            return name.trim().replace(/^(dr\.?|doctor)\s+/i, 'Dr. ');
        } else {
            // Add Dr. prefix
            return `Dr. ${name.trim()}`;
        }
    }

    async validateWithMagento() {
        console.log('🔍 Calling Magento API for:', this.userEmail);
        
        try {
            const response = await fetch(CONFIG.urls.magentoApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getCustomer',
                    email: this.userEmail
                })
            });

            console.log('📡 Magento response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('📦 Magento API result:', result);

            if (result.success && result.customer) {
                const firstName = result.customer.firstname || '';
                const lastName = result.customer.lastname || '';
                
                if (firstName || lastName) {
                    this.userName = `${firstName} ${lastName}`.trim();
                    this.userDisplayName = this.formatDoctorName(this.userName);
                    console.log('✅ Name from Magento:', this.userName);
                    console.log('✅ Display name:', this.userDisplayName);
                } else {
                    console.warn('⚠️ Magento returned empty name, using email');
                    this.setFallbackName();
                }
            } else {
                console.warn('⚠️ Magento customer not found:', result.error || 'Unknown error');
                this.setFallbackName();
            }
        } catch (err) {
            console.error('❌ Magento API error:', err.message);
            this.setFallbackName();
        }
    }

    setFallbackName() {
        // Use email username as fallback
        const emailUsername = this.userEmail.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        const cleanName = emailUsername
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        this.userName = cleanName;
        this.userDisplayName = this.formatDoctorName(cleanName);
        console.log('🔄 Using fallback name:', this.userName);
        console.log('🔄 Fallback display name:', this.userDisplayName);
    }

    async createUser() {
        if (!this.client) return;

        try {
            console.log('💾 Creating new user in Supabase...');
            console.log('   Email:', this.userEmail);
            console.log('   Name:', this.userName);
            console.log('   Display Name:', this.userDisplayName);

            const { data, error } = await this.client
                .from('clinical_users')
                .insert([{
                    email: this.userEmail,
                    name: this.userName,
                    display_name: this.userDisplayName,
                    attempts_used: 0,
                    best_score: 0,
                    best_accuracy: 0,
                    total_games: 0,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            this.userId = data.id;
            this.attemptsUsed = 0;
            console.log('✅ User created successfully:', this.userId);
        } catch (err) {
            console.error('❌ Create user error:', err);
        }
    }

    async loadUserAttempts() {
        if (!this.client || !this.userId) return;

        try {
            const { data, error } = await this.client
                .from('clinical_attempts')
                .select('*')
                .eq('user_id', this.userId)
                .eq('is_practice', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.previousAttempts = data || [];
        } catch (err) {
            console.error('Load attempts error:', err);
        }
    }

    async loadRewards() {
        if (!this.client) {
            this.rewards = CONFIG.rewardTiers;
            return;
        }

        try {
            const { data, error } = await this.client
                .from('reward_config')
                .select('*')
                .eq('active', true)
                .order('min_accuracy', { ascending: false });

            if (error) throw error;

            this.rewards = data && data.length > 0 ? data : CONFIG.rewardTiers;
        } catch (err) {
            console.warn('Load rewards error, using fallback:', err);
            this.rewards = CONFIG.rewardTiers;
        }
    }

    async loadLeaderboard() {
        if (!this.client) return;

        try {
            const { data, error } = await this.client
                .from('clinical_users')
                .select('display_name, best_score, best_accuracy, total_games')
                .gt('best_score', 0)
                .order('best_score', { ascending: false })
                .order('best_accuracy', { ascending: false })
                .limit(50);

            if (error) throw error;

            this.leaderboard = (data || []).map((user, index) => ({
                rank: index + 1,
                name: user.display_name || 'Dr. Anonymous',
                score: user.best_score || 0,
                accuracy: user.best_accuracy || 0,
                games: user.total_games || 0
            }));

            console.log('📊 Leaderboard loaded:', this.leaderboard.length, 'players');
        } catch (err) {
            console.error('Load leaderboard error:', err);
            this.leaderboard = [];
        }
    }

    getTopPlayers(count = 3) {
        return this.leaderboard.slice(0, count);
    }

    getRewardForAccuracy(accuracy) {
        for (const reward of this.rewards) {
            if (accuracy >= reward.min_accuracy && accuracy <= reward.max_accuracy) {
                return reward;
            }
        }
        return this.rewards[this.rewards.length - 1];
    }

    hasRewardAttemptsLeft() {
        return this.attemptsUsed < CONFIG.game.maxRewardAttempts;
    }

    async submitAttempt(attemptData) {
        if (!this.client || !this.userId) {
            console.error('Cannot submit: No client or user');
            return { success: false };
        }

        const isPractice = !this.hasRewardAttemptsLeft();

        try {
            // Insert attempt
            const { data, error } = await this.client
                .from('clinical_attempts')
                .insert([{
                    user_id: this.userId,
                    procedure_id: attemptData.procedureId,
                    procedure_name: attemptData.procedureName,
                    accuracy: attemptData.accuracy,
                    time_taken: attemptData.timeTaken,
                    is_perfect: attemptData.isPerfect,
                    is_practice: isPractice,
                    reward_title: attemptData.rewardTitle,
                    coupon_code: attemptData.couponCode,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Update user stats
            if (!isPractice) {
                const updateData = { 
                    attempts_used: this.attemptsUsed + 1,
                    last_attempt_at: new Date().toISOString(),
                    total_games: (await this.getTotalGames()) + 1
                };

                // Update best score if this is better
                const currentBest = await this.getBestScore();
                if (attemptData.accuracy > currentBest.accuracy) {
                    updateData.best_score = attemptData.accuracy;
                    updateData.best_accuracy = attemptData.accuracy;
                }

                const { error: updateError } = await this.client
                    .from('clinical_users')
                    .update(updateData)
                    .eq('id', this.userId);

                if (updateError) throw updateError;

                this.attemptsUsed++;
            }

            // Reload leaderboard
            await this.loadLeaderboard();

            // Submit to backend
            await this.submitToBackend(attemptData);

            return { success: true, data };
        } catch (err) {
            console.error('Submit attempt error:', err);
            return { success: false, error: err.message };
        }
    }

    async getBestScore() {
        if (!this.client || !this.userId) return { accuracy: 0 };

        try {
            const { data } = await this.client
                .from('clinical_users')
                .select('best_score, best_accuracy')
                .eq('id', this.userId)
                .single();

            return {
                accuracy: data?.best_accuracy || 0,
                score: data?.best_score || 0
            };
        } catch (err) {
            return { accuracy: 0 };
        }
    }

    async getTotalGames() {
        if (!this.client || !this.userId) return 0;

        try {
            const { data } = await this.client
                .from('clinical_users')
                .select('total_games')
                .eq('id', this.userId)
                .single();

            return data?.total_games || 0;
        } catch (err) {
            return 0;
        }
    }

    async submitToBackend(attemptData) {
        try {
            await fetch(CONFIG.urls.submitGame, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.userEmail,
                    name: this.userName,
                    display_name: this.userDisplayName,
                    procedure: attemptData.procedureName,
                    accuracy: attemptData.accuracy,
                    time_taken: attemptData.timeTaken,
                    is_perfect: attemptData.isPerfect,
                    reward: attemptData.rewardTitle,
                    coupon_code: attemptData.couponCode,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (err) {
            console.warn('Backend submit warning:', err);
        }
    }

    getPreviousRewards() {
        if (!this.previousAttempts || this.previousAttempts.length === 0) {
            return [];
        }

        return this.previousAttempts
            .filter(a => a.coupon_code && a.coupon_code !== 'PRACTICE')
            .map(a => ({
                title: a.reward_title,
                code: a.coupon_code,
                accuracy: a.accuracy
            }));
    }

    getRandomMessage(type) {
        const messages = CONFIG.funMessages[type] || CONFIG.funMessages.welcome;
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

window.supabaseHandler = new SupabaseHandler();
