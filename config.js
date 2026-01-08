window.CONFIG = {
    supabase: {
        url: 'https://bwuercsdytqsvjgpntjn.supabase.co', // Replace with your Supabase URL
        key: 'sb_publishable_7FZH_o5bA3_QJ-iveY_kFA_K7xeJd9E' // Replace with your Supabase anon key
    },

    urls: {
        magentoApi: '/.netlify/functions/validate-customer',
        submitGame: '/.netlify/functions/submit-game',
        leaderboard: '/.netlify/functions/get-leaderboard',
        shopNow: 'https://pinkblue.in/cart'
    },

    game: {
        maxRewardAttempts: 2,
        timeLimit: 300, // 5 minutes
        perfectScoreBonus: 10
    },

    // 🎯 CLINICAL PROCEDURES (More compact for mobile)
    procedures: {
        crown: {
            id: 'crown',
            title: 'Crown Prep Mastery',
            description: 'Perfect crown preparation workflow',
            icon: '👑',
            difficulty: 'intermediate',
            steps: [
                { id: 1, text: 'Anesthesia and hemostasis control', order: 1 },
                { id: 2, text: 'Tooth preparation with margin design', order: 2 },
                { id: 3, text: 'Place retraction cord in sulcus', order: 3 },
                { id: 4, text: 'Wait 7-10 min for tissue retraction', order: 4 },
                { id: 5, text: 'Remove cord, verify margin visibility', order: 5 },
                { id: 6, text: 'Clean and dry prepared area', order: 6 },
                { id: 7, text: 'Shade selection under natural light', order: 7 },
                { id: 8, text: 'Take final impression', order: 8 }
            ]
        },

        whitening: {
            id: 'whitening',
            title: 'Whitening Protocol',
            description: 'Professional teeth whitening sequence',
            icon: '✨',
            difficulty: 'beginner',
            steps: [
                { id: 1, text: 'Pre-treatment shade assessment', order: 1 },
                { id: 2, text: 'Prophylaxis to remove pellicle', order: 2 },
                { id: 3, text: 'Isolate teeth, protect gingiva', order: 3 },
                { id: 4, text: 'Apply gingival barrier', order: 4 },
                { id: 5, text: 'Light-cure the barrier', order: 5 },
                { id: 6, text: 'Apply whitening gel', order: 6 },
                { id: 7, text: 'LED activation for 15 minutes', order: 7 },
                { id: 8, text: 'Remove gel, assess shade', order: 8 },
                { id: 9, text: 'Apply desensitizing fluoride', order: 9 }
            ]
        },

        rct: {
            id: 'rct',
            title: 'RCT Excellence',
            description: 'Root canal treatment protocol',
            icon: '🦷',
            difficulty: 'advanced',
            steps: [
                { id: 1, text: 'Diagnosis with radiographs', order: 1 },
                { id: 2, text: 'Anesthesia and rubber dam isolation', order: 2 },
                { id: 3, text: 'Access cavity preparation', order: 3 },
                { id: 4, text: 'Locate all canal orifices', order: 4 },
                { id: 5, text: 'Determine working length', order: 5 },
                { id: 6, text: 'Biomechanical prep with files', order: 6 },
                { id: 7, text: 'Irrigation (NaOCl + EDTA)', order: 7 },
                { id: 8, text: 'Dry canals with paper points', order: 8 },
                { id: 9, text: 'Obturation with gutta-percha', order: 9 }
            ]
        },

        extraction: {
            id: 'extraction',
            title: 'Surgical Extraction',
            description: 'Safe tooth extraction sequence',
            icon: '🔧',
            difficulty: 'intermediate',
            steps: [
                { id: 1, text: 'Pre-op assessment + radiographs', order: 1 },
                { id: 2, text: 'Obtain informed consent', order: 2 },
                { id: 3, text: 'Administer local anesthesia', order: 3 },
                { id: 4, text: 'Verify adequate anesthesia', order: 4 },
                { id: 5, text: 'Elevate gingival tissues', order: 5 },
                { id: 6, text: 'Loosen tooth with elevator', order: 6 },
                { id: 7, text: 'Extract with forceps', order: 7 },
                { id: 8, text: 'Debride socket, check fragments', order: 8 },
                { id: 9, text: 'Achieve hemostasis', order: 9 }
            ]
        },

        restoration: {
            id: 'restoration',
            title: 'Composite Filling',
            description: 'Perfect posterior restoration',
            icon: '💎',
            difficulty: 'intermediate',
            steps: [
                { id: 1, text: 'Anesthesia + rubber dam', order: 1 },
                { id: 2, text: 'Remove caries, prepare cavity', order: 2 },
                { id: 3, text: 'Matrix band + wedge placement', order: 3 },
                { id: 4, text: 'Apply etchant (15 seconds)', order: 4 },
                { id: 5, text: 'Rinse, maintain moist dentin', order: 5 },
                { id: 6, text: 'Apply bonding agent + cure', order: 6 },
                { id: 7, text: 'Place composite incrementally', order: 7 },
                { id: 8, text: 'Light-cure each layer', order: 8 },
                { id: 9, text: 'Finish and polish restoration', order: 9 }
            ]
        }
    },

    // 🎁 REWARD TIERS
    rewardTiers: [
        {
            id: 'perfect',
            min_accuracy: 100,
            max_accuracy: 100,
            title: 'Elements Retract Complete Kit',
            description: 'Premium hemostatic kit - FREEBIE + 15% Off',
            coupon_code: 'PERFECT15',
            coupon_discount: '15% + Free Product',
            image_url: 'https://email-editor-resources.s3.amazonaws.com/images/82618240/elements%20retract.png',
            priority: 1
        },
        {
            id: 'excellent',
            min_accuracy: 80,
            max_accuracy: 99,
            title: 'Elements Whitening System',
            description: 'Professional whitening kit - 10% Off',
            coupon_code: 'EXCEL10',
            coupon_discount: '10% Off',
            image_url: 'https://email-editor-resources.s3.amazonaws.com/images/82618240/elements%20bleaching%20kit.png',
            priority: 2
        },
        {
            id: 'good',
            min_accuracy: 60,
            max_accuracy: 79,
            title: 'PinkBlue Premium Burs',
            description: 'Diamond burs - 5% Off',
            coupon_code: 'GOOD5',
            coupon_discount: '5% Off',
            image_url: 'https://pinkblue.in/media/catalog/product/placeholder/default/no-image.png',
            priority: 3
        },
        {
            id: 'practice',
            min_accuracy: 0,
            max_accuracy: 59,
            title: 'Keep Grinding!',
            description: 'Even legends had bad days 😅',
            coupon_code: 'PRACTICE',
            coupon_discount: 'Try again',
            image_url: null,
            priority: 0
        }
    ],

    // 😄 QUIRKY DENTAL HUMOR
    funMessages: {
        welcome: [
            "Welcome back, tooth wizard! 🪄",
            "Ready to show off those skills? 🦷",
            "Let's separate the pros from the denture wearers! 😄",
            "Time to drill... I mean, thrill! 🎯",
            "Another day, another perfect restoration! ✨"
        ],
        loading: [
            "Sterilizing instruments...",
            "Polishing our A-game...",
            "Checking if you flossed today...",
            "Preparing clinical scenarios...",
            "Mixing the perfect shade..."
        ],
        perfect: [
            "Holy molars! Perfect score! 🎉",
            "You're sharper than a scaler! 🔪",
            "Even the tooth fairy is jealous! 🧚",
            "Flawless! Did you peek at the answer key? 😏",
            "Crown-worthy performance! 👑"
        ],
        good: [
            "Solid work, cavity crusher! 💪",
            "Not bad for a Monday! 😊",
            "You've got the touch! ✋",
            "Smooth operator! Keep it up! 🎯",
            "Your patients would approve! 👍"
        ],
        needsPractice: [
            "Even Usain Bolt trips sometimes! 🏃",
            "Rome wasn't built in a day... neither are skills! 🏛️",
            "Hey, at least you didn't drop the handpiece! 😅",
            "Practice makes permanent! Try again! 💪",
            "Your first root canal was probably worse! 😉"
        ],
        practiceMode: [
            "Practice mode: where legends are forged! 🔥",
            "No pressure, just perfection! 😎",
            "Sharpen those skills, doc! 🪛",
            "Every master was once a disaster! 📚",
            "Keep grinding (the skills, not the teeth)! ⚡"
        ]
    }
};
