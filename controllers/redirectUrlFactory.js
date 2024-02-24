const createBaseRedirectUrl = (baseUrl, alias, dynamicParams) => {
  let queryString = alias ? `?linkAlias=${alias}` : '';
  if (dynamicParams) {
    const queryParams = Object.keys(dynamicParams)
      .map((key) => `${key}=${dynamicParams[key]}`)
      .join('&');
    queryString += `${
      alias ? (queryParams ? '&' : '') : queryParams ? '?' : ''
    }${queryParams}`;
  }
  return baseUrl + queryString;
};

const createPlayStoreUrl = (deeplink, dynamicParams) => {
  const basePlayStoreUrl = `https://play.google.com/store/apps/details?id=${deeplink.androidRedirectSettings.packageId}&referrer=`;

  const queryParams = Object.keys(dynamicParams)
    .map((key) => `${key}=${dynamicParams[key]}`)
    .join('&');
  const referrer = `linkAlias=${deeplink.alias}${
    queryParams ? `&${queryParams}` : ''
  }`;

  const encodedReferrer = encodeURIComponent(referrer);
  return basePlayStoreUrl + encodedReferrer;
};

exports.buildRedirectUrl = (deeplink, platform, dynamicParams) => {
  const redirectSettings =
    deeplink[`${platform}RedirectSettings`] || deeplink.defaultRedirectSettings;
  const baseUrl =
    redirectSettings.redirectURL ||
    deeplink.defaultRedirectSettings.redirectURL;

  if (
    platform === 'android' &&
    deeplink.androidRedirectSettings &&
    deeplink.androidRedirectSettings.redirectToPlayStore &&
    deeplink.androidRedirectSettings.packageId
  ) {
    return createPlayStoreUrl(deeplink, dynamicParams);
  }
  return createBaseRedirectUrl(baseUrl, deeplink.alias, dynamicParams);
};

/**
 * If mobil app already installed, and we want to navigate out the user from the mobil app.
 * The link will open inside a WebView which launched from the mobile SDK.
 * @param deeplink
 * @param clientPlatform
 * @returns {String | StringConstructor}
 */
exports.getRedirectUrlForInstalledMobilClients = (deeplink, clientPlatform) => {
  let redirectUrl;
  switch (clientPlatform) {
    case 'android':
      if (
        deeplink.androidRedirectSettings &&
        deeplink.androidRedirectSettings.redirectURL
      ) {
        redirectUrl = deeplink.androidRedirectSettings.redirectURL;
      }
      break;
    case 'ios':
      // TODO - Implement later
      break;
    default:
      break;
  }
  return redirectUrl;
};
