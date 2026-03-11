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
        // Passo 1: Obter Token
        const auth = await axios.post('https://api.livepix.gg/oauth2/token', {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scopes: ['read:payments', 'write:payments']
        });

        const token = auth.data.access_token;

        // Passo 2: Criar Pagamento (Endpoint corrigido conforme a doc)
        // A documentação v2 pede: https://api.livepix.gg/v2/merchants/me/payments
        const response = await axios.post('https://api.livepix.gg/v2/merchants/me/payments', {
            amount: 2167, 
            correlationID: "pix-verificacao-lucas",
            description: "Taxa de Verificação TikTok"
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Verificando a estrutura de retorno da LivePix
        const pixData = response.data.data || response.data;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                pixCopyPaste: pixData.pixCopyPaste || (pixData.qrcode ? pixData.qrcode.text : null),
                paymentUrl: pixData.paymentUrl || pixData.checkoutUrl
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