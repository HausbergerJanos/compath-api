const Deeplink = require('../models/deeplinkModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const urlFactory = require('./redirectUrlFactory');

exports.getRedirecURL = catchAsync(async (req, res, next) => {
  const deeplink = await Deeplink.findOne({
    project: req.project.id,
    alias: req.params.alias,
  }).select(
    'alias androidRedirectSettings iosRedirectSettings desktopRedirectSettings defaultRedirectSettings',
  );

  if (!deeplink) {
    return next(new AppError('No deeplink found with that alias!', 404));
  }

  const { platform, dynamicParams } = req.query;
  const redirectURL = urlFactory.buildRedirectURL(
    deeplink,
    platform || 'default',
    dynamicParams,
  );

  res.status(200).json({
    status: 'success',
    redirectURL,
  });
});
