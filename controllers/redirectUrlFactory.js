const createBaseRedirectURL = (baseURL, alias, dynamicParams) => {
  let queryString = alias ? `?linkAlias=${alias}` : '';
  if (dynamicParams) {
    const queryParams = Object.keys(dynamicParams)
      .map((key) => `${key}=${dynamicParams[key]}`)
      .join('&');
    queryString += `${
      alias ? (queryParams ? '&' : '') : queryParams ? '?' : ''
    }${queryParams}`;
  }
  return baseURL + queryString;
};

const createPlayStoreURL = (deeplink, dynamicParams) => {
  const basePlayStoreURL = `https://play.google.com/store/apps/details?id=${deeplink.androidRedirectSettings.packageId}&referrer=`;

  const queryParams = Object.keys(dynamicParams)
    .map((key) => `${key}=${dynamicParams[key]}`)
    .join('&');
  const referrer = `linkAlias=${deeplink.alias}${
    queryParams ? `&${queryParams}` : ''
  }`;

  const encodedReferrer = encodeURIComponent(referrer);
  return basePlayStoreURL + encodedReferrer;
};

exports.buildRedirectURL = (deeplink, platform, dynamicParams) => {
  const redirectSettings =
    deeplink[`${platform}RedirectSettings`] || deeplink.defaultRedirectSettings;
  const baseURL =
    redirectSettings.redirectURL ||
    deeplink.defaultRedirectSettings.redirectURL;

  if (
    platform === 'android' &&
    deeplink.androidRedirectSettings &&
    deeplink.androidRedirectSettings.redirectToPlayStore &&
    deeplink.androidRedirectSettings.packageId
  ) {
    return createPlayStoreURL(deeplink, dynamicParams);
  }
  return createBaseRedirectURL(baseURL, deeplink.alias, dynamicParams);
};
