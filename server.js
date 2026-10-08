const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'UltraFetch',
    message: 'Server is running successfully.'
  });
});

app.post('/api/download', async (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Please send a valid URL in the request body.'
    });
  }

  const targetUrl = url.trim();

  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      responseType: 'arraybuffer',
      maxRedirects: 10,
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 UltraFetch/1.0',
        Accept: '*/*'
      }
    });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const contentDisposition = response.headers['content-disposition'] || 'attachment';
    const match = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    const fileName = match ? match[1] : 'downloaded-file';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(response.data));
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data
      ? 'The target server rejected the direct download request.'
      : 'The file could not be fetched. Please use a direct downloadable URL.';

    res.status(statusCode).json({
      error: message,
      details: 'CORS, server restrictions, or protected media may block the file.'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`UltraFetch running at http://localhost:${PORT}`);
});
