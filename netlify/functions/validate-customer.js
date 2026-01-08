const https = require('https');

const MAGENTO_TOKEN = process.env.MAGENTO_API_TOKEN || '';
const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL || 'https://pinkblue.in/rest/V1';

// FIREWALL BYPASS HEADERS (WHITELISTED)
const FIREWALL_HEADERS = {
    'Authorization': `Bearer ${MAGENTO_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'PB_Netlify',
    'X-Source-App': 'ClinicalMastery',
    'X-Netlify-Secret': 'X-PB-NetlifY2025-901AD7EE35110CCB445F3CA0EBEB1494'
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

async function getCustomerByEmail(email) {
    return new Promise((resolve, reject) => {
        const endpoint = `/customers/search?searchCriteria[filterGroups][0][filters][0][field]=email&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(email)}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`;
        const url = `${MAGENTO_BASE_URL}${endpoint}`;

        const req = https.request(url, {
            method: 'GET',
            headers: FIREWALL_HEADERS,
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.items && parsed.items.length > 0) {
                        const customer = parsed.items[0];
                        resolve({
                            success: true,
                            customer: {
                                id: customer.id,
                                email: customer.email,
                                firstname: customer.firstname,
                                lastname: customer.lastname
                            }
                        });
                    } else {
                        resolve({ success: false, error: 'Customer not found' });
                    }
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.abort();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

exports.handler = async (event) => {
    console.log('🚀 Clinical Mastery - Validate Customer');

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { action, email } = body;

        if (action === 'getCustomer' && email) {
            const result = await getCustomerByEmail(email);
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify(result)
            };
        }

        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: 'Invalid request' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
