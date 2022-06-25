const containerQr = document.getElementById('container_qr');
const form = document.getElementById('form');
const link = document.getElementById('url');


// new QRCode(containerQr, 'docs.google.com/forms/d/e/1FAIpQLSdU0ZnjL4NlnZEdeEnrPYxDhE2WJF6O9MwHP9IyioAhVAGY9g/viewform');

const QR = new QRCode(containerQr);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    QR.makeCode(link.value);
})


// ------------

// let btn = document.getElementById('btn');

// btn.addEventListener('click', () => {
//     link.value = '';
// })