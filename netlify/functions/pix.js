const axios = require('axios');
const qs = require('querystring');

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    // 1. Pegar o valor enviado pelo clique do botão no HTML
    const body = JSON.parse(event.body);
    const valorCentavos = Math.round(body.valor * 100); // Converte R$ para centavos

    const clientId = "d8b77fe4-0267-4057-9a7c-74a022ee1b6a";
    const clientSecret = "TpFd9aUHi/dH3tF7dMwz2tPHm6dE3hx4I55fALYyunUtJUF7h4N6uXDGM/SOome+wWE5RqTccBufdKZJ5mWLtdcrCALzQ2+UhSMkcQYXG/EK9ChwkMOfQ4K62G4HDpWsD2K5AI8u3Rt/kZfJ7eHBzQXCaNNUk9Nega2yvT8gxUw";

    try {
        const authResponse = await axios.post(
            'https://oauth.livepix.gg/oauth2/token',
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: 'payments:write'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const token = authResponse.data.access_token;

        // 2. Criar Pagamento com o valor dinâmico
        const response = await axios.post('https://api.livepix.gg/v2/payments', {
            amount: valorCentavos, 
            currency: "BRL",
            redirectUrl: "https://apilivepix.netlify.app/" 
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
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