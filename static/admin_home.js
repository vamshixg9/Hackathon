document.addEventListener('DOMContentLoaded', function () {
    const startScanBtn = document.getElementById('start-scan-btn');
    const scannerModal = document.getElementById('scanner-modal');
    const scannerClose = document.getElementById('scanner-close');
    const qrReaderContainer = document.getElementById('qr-reader');
    const scannerStatus = document.getElementById('scanner-status');

    let html5QrCode;

    function startQRScanner() {
        if (html5QrCode) {
            html5QrCode.clear();
        }

        scannerModal.style.display = 'flex';
        scannerStatus.textContent = 'Scanning...';

        html5QrCode = new Html5Qrcode("qr-reader");

        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                html5QrCode.stop().then(() => {
                    scannerStatus.textContent = 'Verifying...';

                    fetch('/api/admin/scan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: decodedText })
                    })
                        .then(res => res.json())
                        .then(data => {
                            scannerStatus.textContent = data.success
                                ? 'QRコードのスキャンに成功しました'
                                : 'QRコードのスキャンに失敗しました: ' + (data.message || '無効なQRコードです');

                            setTimeout(() => {
                                scannerModal.style.display = 'none';
                                scannerStatus.textContent = '';
                                qrReaderContainer.innerHTML = ''; // Clear scanner
                            }, 2000);
                        })
                        .catch(err => {
                            console.error(err);
                            scannerStatus.textContent = 'Server error.';
                            setTimeout(() => {
                                scannerModal.style.display = 'none';
                                qrReaderContainer.innerHTML = '';
                            }, 2000);
                        });
                }).catch(err => {
                    console.error('Failed to stop QR scanner:', err);
                });
            },
            errorMessage => {
                // Optional: silent on read fail
            }
        ).catch(err => {
            scannerStatus.textContent = 'Camera error';
            console.error(err);
        });
    }

    startScanBtn.addEventListener('click', startQRScanner);

    scannerClose.addEventListener('click', () => {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                scannerModal.style.display = 'none';
                qrReaderContainer.innerHTML = '';
            }).catch(err => {
                console.error('Error stopping camera:', err);
                scannerModal.style.display = 'none';
                qrReaderContainer.innerHTML = '';
            });
        } else {
            scannerModal.style.display = 'none';
        }
    });
});
