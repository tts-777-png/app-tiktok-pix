const axios = require('axios');

exports.handler = async (event) => {

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    const clientId = "d8b77fe4-0267-4057-9a7c-74a022ee1b6a";
    const clientSecret = "SEU_SECRETTpFd9aUHi/dH3tF7dMwz2tPHm6dE3hx4I55fALYyunUtJUF7h4N6uXDGM/SOome+wWE5RqTccBufdKZJ5mWLtdcrCALzQ2+UhSMkcQYXG/EK9ChwkMOfQ4K62G4HDpWsD2K5AI8u3Rt/kZfJ7eHBzQXCaNNUk9Nega2yvT8gxUw";

    try {

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", clientId);
        params.append("client_secret", clientSecret);

        const authResponse = await axios.post(
            "https://api.livepix.gg/oauth/token",
            params,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const token = authResponse.data.access_token;

        const paymentResponse = await axios.post(
            "https://api.livepix.gg/v2/payments",
            {
                amount: 2167,
                correlationID: "pix-verificacao",
                description: "Taxa de Verificação"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(paymentResponse.data)
        };

    } catch (error) {

        console.error("Erro LivePix:", error.response?.data || error.message);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "Erro na API",
                details: error.response?.data || error.message
            })
        };
    }
};