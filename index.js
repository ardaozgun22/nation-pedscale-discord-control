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
    const start = Date.now();
    try {
        const response = await axios.get(
            `https://discord.com/api/guilds/${guildId}/members/${discordId}`,
            {
                headers: {
                    Authorization: botToken
                },
                timeout: 8000
            }
        );
    
        const userRoles = response.data.roles || [];
        const hasRole = userRoles.some(role => roles.includes(role));
    
        return res.status(200).json({ hasRole });
    } catch (error) {
        const status = error.response?.status || 500;
        const msg = error.response?.data?.message || error.message || "Unknown error";
        const duration = Date.now() - start;

        if (error.code === 'ECONNABORTED') {
            console.error(`⏰ [${discordId}] 10 saniyeyi geçti, timeout (${duration}ms)`);
        } else if (status === 429) {
            console.error(`⚠️ [${discordId}] Discord rate limit (429) - tekrar deneme gecikmesi olabilir`);
        } else {
            console.error(`❌ [${discordId}] Discord API hatası [${status}]: ${msg} (${duration}ms)`);
        }

        res.status(200).json({
            hasRole: false,
            error: msg,
            discordStatus: status,
            responseTimeMs: duration
        });
    }
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
