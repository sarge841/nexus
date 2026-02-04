const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// In-memory storage for shared presets
// Key: shortId, Value: Preset JSON object
// This is ephemeral and resets on server restart as requested.
const sharedPresets = new Map();

// Serve static frontend files
// Serve static frontend files
const distPath = process.env.DIST_PATH || path.join(__dirname, '../dist');
console.log(`[SERVER] Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Graceful Shutdown
const shutdown = () => {
    console.log('[SERVER] Received kill signal, shutting down gracefully');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// API Extension: Share Preset
app.post('/api/share', (req, res) => {
    try {
        const preset = req.body;
        if (!preset || !preset.intervals) {
            return res.status(400).json({ error: 'Invalid preset data' });
        }

        const shortId = nanoid(8); // 8-char short ID
        sharedPresets.set(shortId, preset);

        console.log(`[SHARE] Created link for preset "${preset.name}": /s/${shortId}`);
        res.json({ shortId });
    } catch (err) {
        console.error('[SHARE] Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Extension: Get Shared Preset
app.get('/api/share/:id', (req, res) => {
    const { id } = req.params;
    const preset = sharedPresets.get(id);

    if (!preset) {
        return res.status(404).json({ error: 'Preset not found or expired' });
    }

    res.json(preset);
});

// Catch-all: specific handling for /s/:id deep links to ensure they load the SPA
app.get('/s/:id', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Catch-all for everything else (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Nexus Server running on port ${port}`);
});
