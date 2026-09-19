const splashStatusText = document.getElementById('splashStatusText');
const splashPercentText = document.getElementById('splashPercentText');
const splashProgressBar = document.getElementById('splashProgressBar');

if (window.splashApi) {
    window.splashApi.onStatus((status) => {
        if (splashStatusText && status) {
            splashStatusText.textContent = status;
        }
    });

    window.splashApi.onProgress((percent) => {
        if (splashProgressBar) {
            splashProgressBar.classList.remove('indeterminate');
            splashProgressBar.style.width = `${percent}%`;
        }
        if (splashPercentText) {
            splashPercentText.textContent = `${percent}%`;
        }
    });
}
