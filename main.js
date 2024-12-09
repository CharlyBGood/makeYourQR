const containerQr = document.getElementById("container_qr");
const form = document.getElementById("form");
const link = document.getElementById("url");

const QR = new QRCode(containerQr);

const loadFile = function (event) {
  let image = document.getElementById("qr_logo");
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image.src = e.target.result;
    };
    reader.onerror = function () {
      alert("Error al cargar la imagen. Inténtalo de nuevo.");
    };
    reader.readAsDataURL(file);
  }
  image.classList.remove("qr_logo_hidden");
  image.classList.add("qr_logo");
};

const finalQr = form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (link.value.trim() === "") {
    alert("Por favor, ingresa un texto o enlace.");
    return;
  }
  QR.clear();
  QR.makeCode(link.value);
});

document.querySelector("button#toggle-mode").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

let saveBtn = document.getElementById("save_qr");
saveBtn.addEventListener("click", downloadQR);

function downloadQR(e) {
  e.preventDefault();
  const qrCanvas = containerQr.querySelector("canvas"); // Canvas generado por QRCode
  const logoImg = document.getElementById("qr_logo"); // Imagen del logo
  if (!qrCanvas) {
    alert("No hay un QR generado para descargar.");
    return;
  }

  // Crear un nuevo canvas
  const combinedCanvas = document.createElement("canvas");
  const ctx = combinedCanvas.getContext("2d");

  // Establecer el tamaño del nuevo canvas al del QR original
  combinedCanvas.width = qrCanvas.width;
  combinedCanvas.height = qrCanvas.height;

  // Dibujar el QR en el nuevo canvas
  ctx.drawImage(qrCanvas, 0, 0);

  // Dibujar el logo en el centro, si existe
  if (!logoImg.classList.contains("qr_logo_hidden")) {
    const logoSize = qrCanvas.width * 0.2; // Ajusta el tamaño del logo (20% del tamaño del QR)
    const logoX = (combinedCanvas.width - logoSize) / 2;
    const logoY = (combinedCanvas.height - logoSize) / 2;

    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  }

  // Convertir el canvas combinado a una imagen
  const dataURL = combinedCanvas.toDataURL("image/png");
  downloadImage(dataURL, "qr_code.png"); // Descargar la imagen
}

function downloadImage(data, filename = "untitled.png") {
  let a = document.createElement("a");
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a); // Limpieza del DOM
}
