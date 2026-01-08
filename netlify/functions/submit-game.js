const axios = require('axios');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    console.log('🎮 Clinical Mastery - Game Submission');

    try {
        const gameData = JSON.parse(event.body || '{}');
        const {
            email,
            name,
            procedure,
            accuracy,
            time_taken,
            is_perfect,
            reward,
            coupon_code,
            timestamp
        } = gameData;

        // Validate required fields
        if (!email || !procedure) {
            return {
                statusCode: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: email, procedure'
                })
            };
        }

        console.log('📊 Game Data:', { email, procedure, accuracy, is_perfect });

        // Submit to WebEngage
        const WEBENGAGE_LICENSE_CODE = process.env.WEBENGAGE_LICENSE_CODE;
        const WEBENGAGE_API_KEY = process.env.WEBENGAGE_API_KEY;

        if (!WEBENGAGE_LICENSE_CODE || !WEBENGAGE_API_KEY) {
            console.warn('⚠️ WebEngage credentials not configured');
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'Game data received (WebEngage not configured)',
                    warning: 'WebEngage credentials missing'
                })
            };
        }

        try {
            const webengagePayload = {
                userId: email,
                eventName: 'Clinical_Mastery_Completed',
                eventData: {
                    name: name || email.split('@')[0],
                    procedure: procedure,
                    accuracy: accuracy,
                    time_taken: time_taken,
                    time_taken_formatted: `${Math.floor(time_taken / 60)}m ${time_taken % 60}s`,
                    is_perfect: is_perfect,
                    reward_title: reward,
                    coupon_code: coupon_code,
                    timestamp: timestamp || new Date().toISOString(),
                    game_type: 'clinical_procedure',
                    platform: 'web'
                }
            };

            console.log('🚀 Sending to WebEngage:', { userId: email, eventName: 'Clinical_Mastery_Completed' });

            const endpoint = `https://api.webengage.com/v1/accounts/${WEBENGAGE_LICENSE_CODE}/events`;
            const response = await axios.post(endpoint, webengagePayload, {
                headers: {
                    'Authorization': `Bearer ${WEBENGAGE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });

            console.log('✅ WebEngage event sent successfully:', response.status);

            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'Game submission successful!',
                    webengage_status: 'sent'
                })
            };

        } catch (webengageError) {
            console.error('❌ WebEngage error:', webengageError.message);
            console.error('WebEngage response:', webengageError.response?.data);

            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'Game data received but WebEngage failed',
                    webengage_error: webengageError.message
                })
            };
        }

    } catch (error) {
        console.error('❌ Submission error:', error.message);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};
