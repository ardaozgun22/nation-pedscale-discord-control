const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/check-role', async (req, res) => {
    const { discordId, roles, guildId, botToken } = req.body;

    if (!discordId || !roles || !Array.isArray(roles) || !guildId || !botToken) {
        return res.status(400).json({ error: 'discordId, roles, guildId ve botToken alanları zorunludur.' });
    }

    try {
        const response = await axios.get(
            `https://discord.com/api/guilds/${guildId}/members/${discordId}`,
            {
                headers: {
                    Authorization: botToken
                }
            }
        );
    
        const userRoles = response.data.roles || [];
        const hasRole = userRoles.some(role => roles.includes(role));
    
        return res.status(200).json({ hasRole });
    } catch (error) {
        const status = error.response?.status || 500;
        const msg = error.response?.data?.message || error.message || "Unknown error";
        
        console.error(`❌ Discord API Hatası [${status}]: ${msg}`);
        
        const body = JSON.stringify({
        hasRole: false,
        error: msg,
        discordStatus: status
        });
        
        res.writeHead(200, {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "Connection": "close"
        });
        res.end(body);
    }
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
