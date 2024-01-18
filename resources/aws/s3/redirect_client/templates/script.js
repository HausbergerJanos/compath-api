import { baseURL, projectId, projectName, version } from './config.js';

var client = detectClient();
document.getElementById('clientOutput').textContent += ` ${client}`;

var alias;
getAlias();

var redirectURL;

function getURLParameters() {
  var params = window.location.search.slice(1);
  return params;
}

document
  .getElementById('redirectButton')
  .addEventListener('click', function () {
    //window.location = "com.hausberger.application://";
    /**
     window.location.href =
     "intent://#Intent;scheme=https;package=com.hausberger.deeplinktester;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.hausberger.deeplinktester&referrer=utm_source%3Dgoogle%26utm_medium%3Dcpc%26anid%3Dadmob;end";

     */
    window.location.replace(redirectURL);
  });

document.getElementById('paramsOutput').textContent += ` ${getURLParameters()}`;

function detectClient() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // Android detektálása
  if (/android/i.test(userAgent)) {
    return 'android';
  }

  // iOS detektálása
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'ios';
  }

  // Egyéb esetben tekintsd desktopnak
  return 'desktop';
}

function getAlias() {
  alias = window.location.pathname;
  document.getElementById('alias').textContent += ` ${alias}`;
}

document.getElementById('fetchButton').addEventListener('click', function () {
  console.log('Fetch clicked!');
  getDataFromServer();
});

function getDataFromServer() {
  console.log('Get data from server called!');
  document.getElementById('response').textContent = 'Response: ';

  let url = `${baseURL}/api/v1/projects/${projectId}/redirects/${
    alias !== '/' ? alias.slice(1) : undefined
  }?platform=${client}`;
  const parameters = getURLParameters();

  if (parameters) {
    url += `&dynamicParams=${encodeURIComponent(parameters)}`;
  }

  fetch(url, {
    method: 'GET',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Hálózati válasz hiba');
      }
      return response.json();
    })
    .then((data) => {
      console.log('DATA ÁG!');
      console.log(data);
      redirectURL = data.redirectURL;
      document.getElementById('response').textContent += ` ${data.redirectURL}`;
    })
    .catch((error) => {
      console.log('HIBA ÁG!');
      console.error('Hiba történt:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Itt frissítjük az 'h2' elemet a verziószámmal
  document.getElementById('version').textContent = `v${version}`;
  document.getElementById('title').innerHTML =
    `Hello <span style="color: red;">${projectName}</span> project!`;
});
