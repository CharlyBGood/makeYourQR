// DOM elements
const containerQr = document.getElementById("container_qr");
const qrCanvasDiv = document.getElementById("qr-canvas");
const qrOutput = document.getElementById("qr-output");
const qrLogoPlate = document.getElementById("qr-logo-plate");
const form = document.getElementById("form");
const urlInput = document.getElementById("url");
const logoImg = document.getElementById("qr_logo");
const logoControls = document.getElementById("logo-controls");
const logoZoomInput = document.getElementById("logo-zoom");
const logoZoomValue = document.getElementById("logo-zoom-value");
const saveBtn = document.getElementById("save_qr");
const shareStatus = document.getElementById("share-status");
const toggleModeBtn = document.querySelector("button#toggle-mode");
document.getElementById("current-year").textContent = new Date().getFullYear();

let QR = null;
let hasLogo = false;
let lastQrValue = "";

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
    logoImg.onload = function () {
      hasLogo = true;
      showLogo();
      updateLogoZoom();
      if (lastQrValue) renderQRCode(lastQrValue);
    };
    logoImg.src = e.target.result;
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
  qrLogoPlate.classList.remove("qr_logo_hidden");
  logoControls.hidden = false;
}

/**
 * Hide logo
 */
function hidelogo() {
  qrLogoPlate.classList.add("qr_logo_hidden");
  logoControls.hidden = true;
  logoImg.removeAttribute("src");
  hasLogo = false;
  if (lastQrValue) renderQRCode(lastQrValue);
}

/**
 * Generate a QR code with error correction selected for its current content.
 * @param {string} value - Text or URL encoded in the QR code
 */
function renderQRCode(value) {
  while (qrOutput.firstChild) {
    qrOutput.removeChild(qrOutput.firstChild);
  }

  QR = new QRCode(qrOutput, {
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: hasLogo ? QRCode.CorrectLevel.H : QRCode.CorrectLevel.M
  });
  QR.makeCode(value);
  lastQrValue = value;

  const moduleCount = QR._oQRCode.getModuleCount();
  const quietInset = 4 / (moduleCount + 8);
  const symbolScale = 1 - quietInset * 2;
  const imageSize = 0.9;
  qrCanvasDiv.style.setProperty("--qr-quiet-inset", `${quietInset * 100}%`);
  qrCanvasDiv.style.setProperty("--qr-logo-size", `${symbolScale * 0.25 * 100}%`);
  qrLogoPlate.style.setProperty("--qr-logo-image-size", `${imageSize * 100}%`);
  shareStatus.textContent = "";
}

function updateLogoZoom() {
  const zoom = Number(logoZoomInput.value) / 100;
  qrLogoPlate.style.setProperty("--qr-logo-zoom", zoom);
  logoZoomValue.value = `${logoZoomInput.value}%`;
  logoZoomValue.textContent = `${logoZoomInput.value}%`;
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

  renderQRCode(inputValue);
  
  // Show share button after QR generation
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
saveBtn.addEventListener("click", shareOrDownloadQR);
logoZoomInput.addEventListener("input", updateLogoZoom);

// Initialize
initializeTheme();

/**
 * Share or download QR code with logo overlay
 * @param {Event} e - Click event
 */
function shareOrDownloadQR(e) {
  e.preventDefault();
  const combinedCanvas = createQrExportCanvas();

  if (!combinedCanvas) {
    alert("No hay un QR generado para compartir.");
    return;
  }

  combinedCanvas.toBlob(async (blob) => {
    if (!blob) {
      shareStatus.textContent = "No se pudo preparar la imagen del QR.";
      return;
    }

    const filename = `qr_code_${Date.now()}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    if (
      window.isSecureContext &&
      navigator.clipboard &&
      typeof navigator.clipboard.write === "function" &&
      typeof ClipboardItem !== "undefined"
    ) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        shareStatus.textContent = "QR copiado al portapapeles.";
        return;
      } catch (error) {
        console.warn("No se pudo copiar la imagen al portapapeles:", error);
      }
    }

    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({
          title: "Código QR generado",
          text: "Mira este QR que generé con makeYourQR",
          files: [file]
        });
        shareStatus.textContent = "QR compartido.";
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          shareStatus.textContent = "Compartir se canceló.";
          return;
        }
        console.error("Error sharing:", error);
      }
    }

    downloadImage(combinedCanvas.toDataURL("image/png"), filename);
    shareStatus.textContent = "Se descargó el PNG del QR para que puedas adjuntarlo.";
  }, "image/png");
}

/**
 * Download the current QR code with its quiet zone and optional logo.
 * @param {Event} e - Click event
 */
function downloadQR(e) {
  e.preventDefault();

  const combinedCanvas = createQrExportCanvas();
  if (!combinedCanvas) {
    alert("No hay un QR generado para descargar.");
    return;
  }

  downloadImage(combinedCanvas.toDataURL("image/png"), `qr_code_${Date.now()}.png`);
}

function createQrExportCanvas() {
  if (!QR || !QR._oQRCode) return null;

  const qrModel = QR._oQRCode;
  const moduleCount = qrModel.getModuleCount();
  const moduleSize = 8;
  const quietZoneModules = 4;
  const totalModules = moduleCount + quietZoneModules * 2;
  const outputCanvas = document.createElement("canvas");
  const context = outputCanvas.getContext("2d");

  outputCanvas.width = totalModules * moduleSize;
  outputCanvas.height = totalModules * moduleSize;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  context.fillStyle = "#000000";

  for (let row = 0; row < moduleCount; row++) {
    for (let column = 0; column < moduleCount; column++) {
      if (qrModel.isDark(row, column)) {
        context.fillRect(
          (column + quietZoneModules) * moduleSize,
          (row + quietZoneModules) * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }

  if (hasLogo && logoImg.src && !qrLogoPlate.classList.contains("qr_logo_hidden")) {
    drawLogoOnCanvas(context, outputCanvas, logoImg, moduleCount * moduleSize);
  }

  return outputCanvas;
}

/**
 * Draw a centered logo plate while preserving the image proportions.
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {HTMLCanvasElement} canvas - Export canvas
 * @param {HTMLImageElement} image - User logo
 * @param {number} symbolSize - QR symbol size, excluding its quiet zone
 */
function drawLogoOnCanvas(context, canvas, image, symbolSize) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (!imageWidth || !imageHeight) return;

  const plateSize = symbolSize * 0.25;
  const plateX = (canvas.width - plateSize) / 2;
  const plateY = (canvas.height - plateSize) / 2;
  const borderWidth = canvas.width / 1024;
  const zoom = Number(logoZoomInput.value) / 100;
  const logoBoxSize = plateSize * 0.9 * zoom;
  const imageRatio = imageWidth / imageHeight;
  const logoWidth = imageRatio >= 1 ? logoBoxSize : logoBoxSize * imageRatio;
  const logoHeight = imageRatio >= 1 ? logoBoxSize / imageRatio : logoBoxSize;
  const logoX = (canvas.width - logoWidth) / 2;
  const logoY = (canvas.height - logoHeight) / 2;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, plateSize / 2, 0, Math.PI * 2);
  context.closePath();
  context.fillStyle = "#ffffff";
  context.strokeStyle = "rgba(12, 7, 15, 0.18)";
  context.lineWidth = borderWidth;
  context.fill();
  context.stroke();
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, logoBoxSize / 2, 0, Math.PI * 2);
  context.clip();
  context.drawImage(image, logoX, logoY, logoWidth, logoHeight);
  context.restore();
}

/**
 * Trigger download of image data.
 * @param {string} dataURL - Image data URL
 * @param {string} filename - Download filename
 */
function downloadImage(dataURL, filename = "qr_code.png") {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
