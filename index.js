const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/check-role', async (req, res) => {
    const { discordId, roles, guildId, botToken } = req.body;

    if (!discordId || !roles || !Array.isArray(roles) || !guildId || !botToken) {
        return res.status(400).json({ error: 'discordId ve roles alanları zorunludur.' });
    }

    try {
        const response = await axios.get(
            `https://discord.com/api/guilds/${guildId}/members/${discordId}`, {
                headers: {
                Authorization: botToken
                }
            }
        );

        const userRoles = response.data.roles || [];
        const hasRole = userRoles.some(role => roles.includes(role));

        return res.status(200).json({hasRole});
    } catch (error) {
        const status = error.response?.status || 500;
        const msg = error.response?.data?.message || error.message;
        console.error(`Discord API Hatası [${status}]: ${msg}`);
        return res.status(status).json({hasRole: false, error: msg});
    }
});

app.listen(port, () => {});
