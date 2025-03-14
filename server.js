const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/3d-portal-example', (req, res) => {
    res.sendFile(path.join(__dirname, 'examples/3d-portal-example.html'));
});

app.get('/2d-portal-example', (req, res) => {
    res.sendFile(path.join(__dirname, 'examples/2d-portal-example.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 