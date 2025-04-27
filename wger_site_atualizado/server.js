const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

const API = "https://wger.de/api/v2";
const TOKEN = "64d8c065b332bb379e054068191a0cde4b155220";

app.use(express.static('.'));

app.get('/api/:endpoint', async (req, res) => {
  const endpoint = req.params.endpoint;
  try {
    const response = await fetch(`${API}/${endpoint}/`, {
      headers: {
        'Authorization': `Token ${TOKEN}`
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erro no proxy:", err);
    res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});
