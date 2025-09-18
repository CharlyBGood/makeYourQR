// DOM elements
const containerQr = document.getElementById("container_qr");
const form = document.getElementById("form");
const urlInput = document.getElementById("url");
const logoImg = document.getElementById("qr_logo");
const saveBtn = document.getElementById("save_qr");
const toggleModeBtn = document.querySelector("button#toggle-mode");

// QR Code instance
const QR = new QRCode(containerQr, {
  width: 256,
  height: 256,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.M
});

// State management
let hasLogo = false;

// File validation constants
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Load and display logo image
 * @param {Event} event - File input change event
 */
const loadFile = function (event) {
  const file = event.target.files[0];
  
  if (!file) {
    hidelogo();
    return;
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    alert("Tipo de archivo no válido. Por favor, usa imágenes JPG, PNG, GIF o WebP.");
    event.target.value = '';
    return;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    alert("El archivo es demasiado grande. El tamaño máximo es 5MB.");
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function (e) {
    logoImg.src = e.target.result;
    showLogo();
    hasLogo = true;
  };
  
  reader.onerror = function () {
    alert("Error al cargar la imagen. Inténtalo de nuevo.");
    hidelogo();
  };
  
  reader.readAsDataURL(file);
};

/**
 * Show logo with animation
 */
function showLogo() {
  logoImg.classList.remove("qr_logo_hidden");
  logoImg.classList.add("qr_logo");
}

/**
 * Hide logo
 */
function hidelogo() {
  logoImg.classList.add("qr_logo_hidden");
  logoImg.classList.remove("qr_logo");
  hasLogo = false;
}

/**
 * Generate QR code
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();
  
  const inputValue = urlInput.value.trim();
  
  if (!inputValue) {
    alert("Por favor, ingresa un texto o enlace.");
    urlInput.focus();
    return;
  }

  // Clear previous QR and generate new one
  QR.clear();
  QR.makeCode(inputValue);
  
  // Show download button after QR generation
  setTimeout(() => {
    saveBtn.style.display = 'flex';
  }, 300);
}

/**
 * Toggle dark/light mode
 */
function toggleMode() {
  document.body.classList.toggle("light-mode");
  
  // Save preference to localStorage
  const isLightMode = document.body.classList.contains("light-mode");
  localStorage.setItem("lightMode", isLightMode);
}

/**
 * Initialize theme from localStorage
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem("lightMode");
  if (savedTheme === "true") {
    document.body.classList.add("light-mode");
  }
}

// Event listeners
form.addEventListener("submit", handleFormSubmit);
toggleModeBtn.addEventListener("click", toggleMode);
saveBtn.addEventListener("click", downloadQR);

// Initialize
initializeTheme();

/**
 * Download QR code with logo overlay
 * @param {Event} e - Click event
 */
function downloadQR(e) {
  e.preventDefault();
  
  const qrCanvas = containerQr.querySelector("canvas");
  
  if (!qrCanvas) {
    alert("No hay un QR generado para descargar.");
    return;
  }

  // Create combined canvas
  const combinedCanvas = document.createElement("canvas");
  const ctx = combinedCanvas.getContext("2d");

  // Set canvas size to match QR
  combinedCanvas.width = qrCanvas.width;
  combinedCanvas.height = qrCanvas.height;

  // Draw QR code
  ctx.drawImage(qrCanvas, 0, 0);

  // Draw logo if exists
  if (hasLogo && logoImg.src && !logoImg.classList.contains("qr_logo_hidden")) {
    drawLogoOnCanvas(ctx, combinedCanvas, logoImg);
  }

  // Download image
  const dataURL = combinedCanvas.toDataURL("image/png", 1.0);
  downloadImage(dataURL, `qr_code_${Date.now()}.png`);
}

/**
 * Draw logo on canvas with proper scaling and styling
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} img - Logo image
 */
function drawLogoOnCanvas(ctx, canvas, img) {
  // Responsive logo size based on canvas size and screen size
  const baseSize = Math.min(canvas.width * 0.18, 60); // Smaller for mobile
  const logoSize = window.innerWidth < 480 ? Math.min(baseSize, 40) : baseSize;
  const logoX = (canvas.width - logoSize) / 2;
  const logoY = (canvas.height - logoSize) / 2;

  // Save context
  ctx.save();

  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  // Draw logo
  ctx.drawImage(img, logoX, logoY, logoSize, logoSize);

  // Restore context
  ctx.restore();

  // Draw border
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 1.5, 0, 2 * Math.PI);
  ctx.lineWidth = window.innerWidth < 480 ? 2 : 3;
  ctx.strokeStyle = '#e7762b'; // portfolio-orange
  ctx.fillStyle = 'white';
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.stroke();
}

/**
 * Trigger download of image data
 * @param {string} dataURL - Image data URL
 * @param {string} filename - Download filename
 */
function downloadImage(dataURL, filename = "qr_code.png") {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
