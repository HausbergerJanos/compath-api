document.addEventListener('DOMContentLoaded', (event) => {
  const redirectURL = document
    .getElementById('redirectData')
    .getAttribute('data-redirect-url');

  if (redirectURL) {
    window.location.href = redirectURL;
  }
});
