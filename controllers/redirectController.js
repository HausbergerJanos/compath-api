const Deeplink = require('../models/deeplinkModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getAndroidRedirectURL = (deeplink) =>
  deeplink.androidRedirectSettings.redirectToPlayStore &&
  deeplink.androidRedirectSettings.packageId
    ? deeplink.androidRedirectSettings.packageId
    : deeplink.androidRedirectSettings.customURL || deeplink.defaultRedirectURL;

exports.getRedirecURL = catchAsync(async (req, res, next) => {
  const deeplink = await Deeplink.findOne({
    project: req.project.id,
    alias: req.params.alias,
  }).select(
    'defaultRedirectURL desktopRedirectURL androidRedirectSettings iosRedurectURL',
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
    redirectURL = `${redirectURL}?${dynamicParams}`;
  }

  res.status(200).json({
    status: 'success',
    redirectURL,
  });
});
