const Deeplink = require('../models/deeplinkModel');
const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');
const urlFactory = require('./redirectUrlFactory');

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
