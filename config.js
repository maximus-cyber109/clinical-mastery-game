// ===========================================
// PINKBLUE CLINICAL MASTERY - CONFIGURATION
// ===========================================

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
        maxRewardAttempts: 2, // Maximum attempts for rewards
        timeLimit: 300, // 5 minutes in seconds
        perfectScoreBonus: 10 // Bonus points for perfect sequence
    },

    // 🎯 CLINICAL PROCEDURES
    procedures: {
        crown: {
            id: 'crown',
            title: 'Perfect Crown Prep Protocol',
            description: 'Master the art of crown preparation and impression',
            icon: '👑',
            difficulty: 'intermediate',
            steps: [
                { id: 1, text: 'Administer local anesthesia and achieve hemostasis', order: 1 },
                { id: 2, text: 'Tooth preparation with proper margin design', order: 2 },
                { id: 3, text: 'Place retraction cord in gingival sulcus', order: 3 },
                { id: 4, text: 'Wait 7-10 minutes for tissue retraction', order: 4 },
                { id: 5, text: 'Remove cord and verify margin visibility', order: 5 },
                { id: 6, text: 'Clean and dry the prepared area', order: 6 },
                { id: 7, text: 'Perform shade selection in optimal lighting', order: 7 },
                { id: 8, text: 'Take final impression with preferred material', order: 8 },
                { id: 9, text: 'Fabricate and cement temporary crown', order: 9 }
            ]
        },

        whitening: {
            id: 'whitening',
            title: 'Professional Whitening Workflow',
            description: 'Execute perfect in-office teeth whitening procedure',
            icon: '✨',
            difficulty: 'beginner',
            steps: [
                { id: 1, text: 'Patient consultation and pre-treatment shade assessment', order: 1 },
                { id: 2, text: 'Prophylaxis - polish teeth to remove pellicle layer', order: 2 },
                { id: 3, text: 'Isolate teeth and protect gingival tissues', order: 3 },
                { id: 4, text: 'Apply gingival barrier (liquid dam)', order: 4 },
                { id: 5, text: 'Light-cure the gingival barrier', order: 5 },
                { id: 6, text: 'Apply whitening gel to tooth surfaces', order: 6 },
                { id: 7, text: 'Activate with LED/laser light for 15 minutes', order: 7 },
                { id: 8, text: 'Remove gel and assess shade improvement', order: 8 },
                { id: 9, text: 'Repeat process 2-3 times if needed', order: 9 },
                { id: 10, text: 'Apply desensitizing fluoride gel', order: 10 }
            ]
        },

        rct: {
            id: 'rct',
            title: 'Root Canal Treatment Protocol',
            description: 'Complete endodontic treatment sequence',
            icon: '🦷',
            difficulty: 'advanced',
            steps: [
                { id: 1, text: 'Diagnosis with radiographs and vitality tests', order: 1 },
                { id: 2, text: 'Local anesthesia and rubber dam isolation', order: 2 },
                { id: 3, text: 'Access cavity preparation', order: 3 },
                { id: 4, text: 'Locate and negotiate all canal orifices', order: 4 },
                { id: 5, text: 'Determine working length (apex locator + radiograph)', order: 5 },
                { id: 6, text: 'Biomechanical preparation with rotary files', order: 6 },
                { id: 7, text: 'Irrigation with NaOCl and EDTA', order: 7 },
                { id: 8, text: 'Dry canals with paper points', order: 8 },
                { id: 9, text: 'Obturation with gutta-percha and sealer', order: 9 },
                { id: 10, text: 'Post-operative radiograph and temporization', order: 10 }
            ]
        },

        extraction: {
            id: 'extraction',
            title: 'Surgical Tooth Extraction',
            description: 'Safe and effective tooth extraction protocol',
            icon: '🔧',
            difficulty: 'intermediate',
            steps: [
                { id: 1, text: 'Pre-operative assessment and radiographic evaluation', order: 1 },
                { id: 2, text: 'Obtain informed consent from patient', order: 2 },
                { id: 3, text: 'Administer local anesthesia (infiltration/block)', order: 3 },
                { id: 4, text: 'Verify adequate anesthesia before proceeding', order: 4 },
                { id: 5, text: 'Elevate gingival tissues with periosteal elevator', order: 5 },
                { id: 6, text: 'Loosen tooth with dental elevator', order: 6 },
                { id: 7, text: 'Extract tooth with appropriate forceps', order: 7 },
                { id: 8, text: 'Debride socket and inspect for fragments', order: 8 },
                { id: 9, text: 'Achieve hemostasis with gauze pressure', order: 9 },
                { id: 10, text: 'Provide post-operative instructions and medications', order: 10 }
            ]
        },

        restoration: {
            id: 'restoration',
            title: 'Composite Restoration Protocol',
            description: 'Perfect posterior composite filling procedure',
            icon: '💎',
            difficulty: 'intermediate',
            steps: [
                { id: 1, text: 'Local anesthesia and rubber dam placement', order: 1 },
                { id: 2, text: 'Remove carious dentin and prepare cavity', order: 2 },
                { id: 3, text: 'Matrix band and wedge placement', order: 3 },
                { id: 4, text: 'Apply etchant (37% phosphoric acid) for 15 seconds', order: 4 },
                { id: 5, text: 'Rinse thoroughly and maintain moist dentin', order: 5 },
                { id: 6, text: 'Apply bonding agent and light-cure', order: 6 },
                { id: 7, text: 'Place composite in 2mm incremental layers', order: 7 },
                { id: 8, text: 'Light-cure each layer for 20-40 seconds', order: 8 },
                { id: 9, text: 'Remove matrix and check occlusion', order: 9 },
                { id: 10, text: 'Finish and polish restoration', order: 10 }
            ]
        }
    },

    // 🎁 REWARD TIERS (stored in Supabase but fallback here)
    rewardTiers: [
        {
            id: 'perfect',
            min_accuracy: 100,
            max_accuracy: 100,
            title: 'Elements Retract Complete Kit',
            description: 'Premium hemostatic retraction kit - FREEBIE + 15% Off',
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
            description: 'Professional in-office whitening kit - 10% Off',
            coupon_code: 'EXCEL10',
            coupon_discount: '10% Off',
            image_url: 'https://email-editor-resources.s3.amazonaws.com/images/82618240/elements%20bleaching%20kit.png',
            priority: 2
        },
        {
            id: 'good',
            min_accuracy: 60,
            max_accuracy: 79,
            title: 'PinkBlue Premium Burs Set',
            description: 'Diamond bur collection - 5% Off',
            coupon_code: 'GOOD5',
            coupon_discount: '5% Off',
            image_url: 'https://pinkblue.in/media/catalog/product/placeholder/default/no-image.png',
            priority: 3
        },
        {
            id: 'practice',
            min_accuracy: 0,
            max_accuracy: 59,
            title: 'Keep Practicing!',
            description: 'Try again to improve your score',
            coupon_code: 'PRACTICE',
            coupon_discount: 'No reward this time',
            image_url: null,
            priority: 0
        }
    ]
};
