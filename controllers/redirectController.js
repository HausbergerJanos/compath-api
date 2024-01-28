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

function detectClient(req) {
  const userAgent = req.headers['user-agent'];

  if (/android/i.test(userAgent)) {
    return 'android';
  }

  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'iOS';
  }

  return 'desktop';
}

exports.getRedirectInfo = catchAsync(async (req, res, next) => {
  const currentProject = await Project.findOne({
    domain: req.host,
  });
  // const currentProject = await Project.findOne({
  //   domain: 'test-project-91.compath.link',
  // });

  let deeplink = await Deeplink.findOne({
    project: currentProject.id,
    alias: req.params.alias,
  }).select(
    'alias linkParams androidRedirectSettings iosRedirectSettings desktopRedirectSettings defaultRedirectSettings',
  );

  if (!deeplink) {
    // Use project's redirectURL as fallback
    deeplink = {
      defaultRedirectSettings: {
        redirectURL: currentProject.defaultRedirectURL,
      },
    };
  }

  const platform = detectClient(req);

  const redirectURL = urlFactory.buildRedirectURL(
    deeplink,
    platform,
    req.query,
  );

  if (currentProject) {
    res.status(200).render('base', {
      project: currentProject,
      alias: req.params.alias,
      query: req.query,
      client: platform,
      deeplink: deeplink,
      redirectURL: redirectURL,
    });
  } else {
    next();
  }
});
