const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('statusText');
const formatText = document.getElementById('formatText');
const previewTitle = document.getElementById('previewTitle');
const previewMessage = document.getElementById('previewMessage');
const sampleBtn = document.getElementById('sampleBtn');
const clearBtn = document.getElementById('clearBtn');

function detectMediaType(url) {
  if (!url) return 'Unknown';

  const lower = url.toLowerCase();
  if (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov')) return 'Video';
  if (lower.includes('.mp3') || lower.includes('.wav') || lower.includes('.aac')) return 'Audio';
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.gif') || lower.includes('.webp')) return 'Image';
  if (lower.includes('youtube') || lower.includes('youtu.be') || lower.includes('instagram') || lower.includes('facebook') || lower.includes('tiktok')) return 'Social Media';
  return 'Direct file';
}

function updateStatus(message, color = '#ebf3ff') {
  statusText.textContent = message;
  statusText.style.color = color;
}

function updatePreview(title, message) {
  previewTitle.textContent = title;
  previewMessage.textContent = message;
}

async function handleDownload() {
  const value = urlInput.value.trim();

  if (!value) {
    updateStatus('Please paste a valid URL', '#f87171');
    updatePreview('No URL entered', 'Add a direct file link or media URL to begin.');
    formatText.textContent = 'Auto detect';
    return;
  }

  const mediaType = detectMediaType(value);
  formatText.textContent = mediaType;

  if (mediaType === 'Social Media') {
    updateStatus('Protected platform detected', '#fbbf24');
    updatePreview('Social media link detected', 'This frontend demo supports direct file URLs. For YouTube/Instagram/Facebook/TikTok extraction, a backend service is required to process the link securely.');
    return;
  }

  updateStatus('Preparing download', '#5eead4');
  updatePreview('Checking media link', `Detected format: ${mediaType}. Trying to fetch a downloadable resource...`);

  try {
    const response = await fetch(value, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = value.split('/').pop() || 'downloaded-file';

    link.href = objectUrl;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);

    updateStatus('Download started', '#34d399');
    updatePreview('Media ready', `The file was downloaded successfully from a direct link.\nFile: ${fileName}`);
  } catch (error) {
    updateStatus('Direct download blocked', '#f87171');
    updatePreview('CORS or access issue', 'The file may be protected or blocked by the server. Try a direct media URL or use a backend-powered downloader for social platforms.');
    console.error(error);
  }
}

downloadBtn.addEventListener('click', handleDownload);
urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleDownload();
});

sampleBtn.addEventListener('click', () => {
  urlInput.value = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';
  handleDownload();
});

clearBtn.addEventListener('click', () => {
  urlInput.value = '';
  updateStatus('Waiting for link', '#ebf3ff');
  formatText.textContent = 'Auto detect';
  updatePreview('No media loaded', 'Paste a file or video URL to begin.');
});
