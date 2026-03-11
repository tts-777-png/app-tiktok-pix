const axios = require('axios');

exports.handler = async (event) => {
    // Cabeçalhos para evitar erro de bloqueio no navegador (CORS)
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    // Responde rapidamente a requisições de pre-flight (OPTIONS)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    // Suas credenciais da LivePix
    const clientId = "d8b77fe4-0267-4057-9a7c-74a022ee1b6a";
    const clientSecret = "TpFd9aUHi/dH3tF7dMwz2tPHm6dE3hx4I55fALYyunUtJUF7h4N6uXDGM/SOome+wWE5RqTccBufdKZJ5mWLtdcrCALzQ2+UhSMkcQYXG/EK9ChwkMOfQ4K62G4HDpWsD2K5AI8u3Rt/kZfJ7eHBzQXCaNNUk9Nega2yvT8gxUw";

    try {
        // 1. Obter Token OAuth2
        const authResponse = await axios.post('https://api.livepix.gg/oauth2/token', {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scopes: ['read:payments', 'write:payments']
        });

        const token = authResponse.data.access_token;

        // 2. Criar o Pagamento (Endpoint unificado)
        // Valor de R$ 21,67 convertido para centavos (2167)
        const paymentResponse = await axios.post('https://api.livepix.gg/payments', {
            amount: 2167, 
            correlationID: "pix-verificacao-tiktok-lucas",
            description: "Taxa de Verificação Reembolsável"
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const pixData = paymentResponse.data;

        // Retorna os dados necessários para o seu index.html exibir o QR Code
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                pixCopyPaste: pixData.pixCopyPaste || (pixData.qrcode ? pixData.qrcode.text : null),
                paymentUrl: pixData.paymentUrl
            })
        };

    } catch (error) {
        // Registra o erro detalhado nos logs do Netlify para debug
        console.error("Erro LivePix:", error.response ? error.response.data : error.message);
        
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ 
                error: "Erro na API", 
                details: error.response ? error.response.data : error.message 
            }) 
        };
    }
};