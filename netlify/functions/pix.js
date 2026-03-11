const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") return { statusCode: 200, body: "" };

    const clientId = "d8b77fe4-0267-4057-9a7c-74a022ee1b6a";
    const clientSecret = "TpFd9aUHi/dH3tF7dMwz2tPHm6dE3hx4I55fALYyunUtJUF7h4N6uXDGM/SOome+wWE5RqTccBufdKZJ5mWLtdcrCALzQ2+UhSMkcQYXG/EK9ChwkMOfQ4K62G4HDpWsD2K5AI8u3Rt/kZfJ7eHBzQXCaNNUk9Nega2yvT8gxUw";

    try {
        // 1. Pega o Token
        const auth = await axios.post('https://api.livepix.gg/oauth2/token', {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scopes: ['read:payments', 'write:payments']
        });

        const token = auth.data.access_token;

        // 2. Cria a Cobrança
        const response = await axios.post('https://api.livepix.gg/v2/payments', {
            amount: 2167, 
            correlationID: "teste-lucas-dev",
            description: "Taxa de Verificação TikTok"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // AJUSTE AQUI: A estrutura da v2 costuma retornar 'data'
        const pixData = response.data.data || response.data;

        return {
            statusCode: 200,
            body: JSON.stringify({
                pixCopyPaste: pixData.pixCopyPaste || pixData.qrcode?.text,
                paymentUrl: pixData.paymentUrl || pixData.checkoutUrl
            })
        };
    } catch (error) {
        // Log para você ver o erro real no console do Netlify se falhar
        console.error("Erro LivePix:", error.response ? error.response.data : error.message);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Erro na API", details: error.message }) 
        };
    }
};