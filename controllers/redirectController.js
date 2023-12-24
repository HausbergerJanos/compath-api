const Deeplink = require('../models/deeplinkModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getPlayStoreURL = (deeplink) => {
  const basePlayStoreURL = `https://play.google.com/store/apps/details?id=${deeplink.androidRedirectSettings.packageId}&referrer=comPathAlias%3D${deeplink.alias}`;
  return basePlayStoreURL;
};

const getAndroidRedirectURL = (deeplink) =>
  deeplink.androidRedirectSettings.redirectToPlayStore &&
  deeplink.androidRedirectSettings.packageId
    ? getPlayStoreURL(deeplink)
    : deeplink.androidRedirectSettings.customURL || deeplink.defaultRedirectURL;

exports.getRedirecURL = catchAsync(async (req, res, next) => {
  const deeplink = await Deeplink.findOne({
    project: req.project.id,
    alias: req.params.alias,
  }).select(
    'alias defaultRedirectURL desktopRedirectURL androidRedirectSettings iosRedurectURL',
  );

  if (!deeplink) {
    return next(new AppError('No deeplink found with that alias!', 404));
  }

  const { platform, dynamicParams } = req.query;
  let redirectURL;

  switch (platform) {
    case 'android':
      redirectURL = getAndroidRedirectURL(deeplink);
      break;
    case 'ios':
      redirectURL = deeplink.iosRedurectURL;
      break;
    case 'desktop':
      redirectURL = deeplink.desktopRedirectURL;
      break;
    default:
      redirectURL = deeplink.defaultRedirectURL;
  }

  if (dynamicParams) {
    console.log(dynamicParams);
    const params = new URLSearchParams(dynamicParams);
    console.log(params);
    //redirectURL = `${redirectURL}?${dynamicParams}`;
  }

  res.status(200).json({
    status: 'success',
    redirectURL,
  });
});
