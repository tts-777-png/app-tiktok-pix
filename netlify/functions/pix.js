const axios = require('axios');
const qs = require('querystring');

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
        // 1. Obter Token OAuth2 usando x-www-form-urlencoded conforme a especificação
        const authResponse = await axios.post(
            'https://oauth.livepix.gg/oauth2/token',
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: 'messages:write payments:write'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const token = authResponse.data.access_token;

        // 2. Criar Mensagem com Pagamento para o usuário 'jogobeta'
        const response = await axios.post('https://api.livepix.gg/v2/messages', {
            username: "jogobeta", 
            amount: 2167, 
            message: "Taxa de Verificação - App TikTok",
            currency: "BRL",
            redirectUrl: "https://apilivepix.netlify.app/"
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = response.data.data;

        // Retorna o pixCopyPaste para exibição interna ou a URL de checkout como fallback
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                pixCopyPaste: result.pixCopyPaste || null,
                paymentUrl: result.redirectUrl || null
            })
        };

    } catch (error) {
        console.error("Erro na LivePix:", error.response ? error.response.data : error.message);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ 
                error: "Falha na API", 
                message: error.response ? error.response.data.message : error.message 
            }) 
        };
    }
};