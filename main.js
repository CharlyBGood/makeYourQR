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

form.addEventListener("submit", (e) => {
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
