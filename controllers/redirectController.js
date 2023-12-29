const Deeplink = require('../models/deeplinkModel');
const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');
const urlFactory = require('./redirectUrlFactory');
const serialization = require('../utils/serialization');

exports.getRedirecURL = catchAsync(async (req, res, next) => {
  let deeplink = await Deeplink.findOne({
    project: req.params.projectId,
    alias: req.params.alias,
  }).select(
    'alias androidRedirectSettings iosRedirectSettings desktopRedirectSettings defaultRedirectSettings',
  );

  if (!deeplink) {
    const project = await Project.findById(req.params.projectId);
    // Use project's redirectURL as fallback
    deeplink = {
      defaultRedirectSettings: {
        redirectURL: project.defaultRedirectURL,
      },
    };
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

exports.getRedirectParams = catchAsync(async (req, res, next) => {
  let deeplink = await Deeplink.findOne({
    project: req.params.projectId,
    alias: req.params.alias,
  }).select(
    'alias linkParams androidRedirectSettings iosRedirectSettings desktopRedirectSettings defaultRedirectSettings',
  );

  if (!deeplink) {
    deeplink = {
      linkParams: null,
    };
  }
  const platform = req.query.platform || 'desktop';

  let redirectUrl;
  // Desktop not needed here
  switch (platform) {
    case 'android':
      if (
        deeplink.androidRedirectSettings &&
        deeplink.androidRedirectSettings.redirectURL &&
        !deeplink.androidRedirectSettings.redirectToPlayStore
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

  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'platform') {
      if (!deeplink.linkParams) {
        deeplink.linkParams = new Map();
      }
      deeplink.linkParams.set(key, value);
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      linkParams: serialization.mapToObject(deeplink.linkParams),
      redirectUrl,
    },
  });
});
