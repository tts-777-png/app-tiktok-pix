const axios = require('axios');

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    const clientId = "d8b77fe4-0267-4057-9a7c-74a022ee1b6a";
    const clientSecret = "TpFd9aUHi/dH3tF7dMwz2tPHm6dE3hx4I55fALYyunUtJUF7h4N6uXDGM/SOome+wWE5RqTccBufdKZJ5mWLtdcrCALzQ2+UhSMkcQYXG/EK9ChwkMOfQ4K62G4HDpWsD2K5AI8u3Rt/kZfJ7eHBzQXCaNNUk9Nega2yvT8gxUw";

    try {
        // 1. Obter Token OAuth2
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('scope', 'payments:write');

        const authResponse = await axios.post('https://oauth.livepix.gg/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const token = authResponse.data.access_token;

        // 2. Criar Solicitação de Pagamento (v2)
        const response = await axios.post('https://api.livepix.gg/v2/payments', {
            amount: 2167, 
            currency: "BRL",
            redirectUrl: "https://apilivepix.netlify.app/" 
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const pixData = response.data.data;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                paymentUrl: pixData.redirectUrl,
                reference: pixData.reference
            })
        };

    } catch (error) {
        console.error("Erro detalhado:", error.response ? error.response.data : error.message);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ 
                error: "Erro na API", 
                message: error.response ? error.response.data.message : error.message 
            }) 
        };
    }
};