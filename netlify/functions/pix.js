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
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('scope', 'messages:write'); // Mudamos o escopo para mensagens

        const authResponse = await axios.post('https://oauth.livepix.gg/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const token = authResponse.data.access_token;

        // Usando o endpoint de mensagens para obter dados brutos do Pix
        const response = await axios.post('https://api.livepix.gg/v2/messages', {
            username: "harrypotter", // Substitua pelo seu username da LivePix se necessário
            amount: 2167, 
            message: "Taxa de Verificação Reembolsável",
            currency: "BRL",
            redirectUrl: "https://apilivepix.netlify.app/"
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // A LivePix retorna o objeto de pagamento dentro da mensagem na v2
        const data = response.data.data;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                pixCopyPaste: data.pixCopyPaste, // O código para o usuário copiar
                paymentUrl: data.redirectUrl    // URL de backup
            })
        };

    } catch (error) {
        console.error("Erro:", error.response ? error.response.data : error.message);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Erro na API", message: error.response ? error.response.data.message : error.message }) 
        };
    }
};