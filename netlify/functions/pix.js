const axios = require('axios');
const qs = require('querystring');

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    try {
        const body = JSON.parse(event.body);
        const valorEmCentavos = Math.round(body.valor * 100);

        const clientId = "d8b77fe4-0267-4057-9a7c-74a022ee1b6a";
        const clientSecret = "TpFd9aUHi/dH3tF7dMwz2tPHm6dE3hx4I55fALYyunUtJUF7h4N6uXDGM/SOome+wWE5RqTccBufdKZJ5mWLtdcrCALzQ2+UhSMkcQYXG/EK9ChwkMOfQ4K62G4HDpWsD2K5AI8u3Rt/kZfJ7eHBzQXCaNNUk9Nega2yvT8gxUw";

        // 1. Token
        const auth = await axios.post('https://oauth.livepix.gg/oauth2/token', 
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: 'payments:write'
            }), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // 2. Criar Pagamento
        const response = await axios.post('https://api.livepix.gg/v2/payments', {
            amount: valorEmCentavos,
            currency: "BRL",
            redirectUrl: "https://apilivepix.netlify.app/"
        }, {
            headers: { Authorization: `Bearer ${auth.data.access_token}` }
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: response.data.data.redirectUrl })
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};