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
    updatePreview(
      'Social media link detected',
      'This app supports direct downloadable media links. For YouTube, Instagram, Facebook, or TikTok, a backend service with platform-specific extraction is required.'
    );
    return;
  }

  updateStatus('Preparing direct download', '#5eead4');
  updatePreview('Checking media link', `Detected format: ${mediaType}. Download request is being processed by the server...`);

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: value })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Download failed');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let fileName = value.split('/').pop() || 'downloaded-file';

    if (contentDisposition) {
      const match = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);

    updateStatus('Download started', '#34d399');
    updatePreview('Media ready', `The direct file download started successfully.\nFile: ${fileName}`);
  } catch (error) {
    updateStatus('Download failed', '#f87171');
    updatePreview(
      'Direct media blocked',
      'The server rejected the file or the link is not directly downloadable. Use a direct file URL and try again.'
    );
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
