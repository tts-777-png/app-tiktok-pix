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
        const auth = await axios.post('https://api.livepix.gg/oauth2/token', {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scopes: ['read:payments', 'write:payments']
        });

        const token = auth.data.access_token;

        // 2. Criar Pagamento (Endpoint V1 conforme seu link)
        // Link: https://api.livepix.gg/v1/payments
        const response = await axios.post('https://api.livepix.gg/v1/payments', {
            amount: 2167, 
            correlationID: "pix-verificacao-tiktok",
            description: "Taxa de Verificação TikTok"
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Na V1 a estrutura é direta
        const pixData = response.data;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                pixCopyPaste: pixData.pixCopyPaste, 
                paymentUrl: pixData.paymentUrl
            })
        };
    } catch (error) {
        console.error("Erro LivePix:", error.response ? error.response.data : error.message);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Erro na API", details: error.response ? error.response.data : error.message }) 
        };
    }
};