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
        // 1. Obter Token OAuth2 (Conforme RFC 6749 citado na doc)
        // A doc pede Content-Type: application/x-www-form-urlencoded para o token
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
        // Endpoint: /v2/payments
        const response = await axios.post('https://api.livepix.gg/v2/payments', {
            amount: 2167, // R$ 21,67 em centavos
            currency: "BRL",
            redirectUrl: "https://apilivepix.netlify.app/" // URL de retorno após pagar
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // A v2 retorna 'data' contendo 'redirectUrl' (URL do Checkout)
        // Nota: A v2 de checkout não retorna o 'pixCopyPaste' direto, 
        // ela retorna a URL para o usuário finalizar o pagamento.
        const pixData = response.data.data;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                paymentUrl: pixData.redirectUrl, // URL onde o usuário verá o Pix
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