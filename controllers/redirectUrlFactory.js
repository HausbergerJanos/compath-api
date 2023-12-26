const createRedirectURL = (baseURL, alias, dynamicParams) => {
  let queryString = alias ? `?linkAlias=${alias}` : '';
  if (dynamicParams) {
    queryString += `${alias ? '&' : '?'}${dynamicParams}`;
  }
  return baseURL + queryString;
};

const createPlayStoreURL = (deeplink, dynamicParams) => {
  const basePlayStoreURL = `https://play.google.com/store/apps/details?id=${deeplink.androidRedirectSettings.packageId}&referrer=`;
  const referrer = `linkAlias=${deeplink.alias}${
    dynamicParams ? `&${dynamicParams}` : ''
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
  return createRedirectURL(baseURL, deeplink.alias, dynamicParams);
};
