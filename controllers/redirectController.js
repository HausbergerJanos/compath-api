const Deeplink = require('../models/deeplinkModel');
const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const urlFactory = require('./redirectUrlFactory');
const { detectClientPlatform } = require('../utils/userAgentUtils');

exports.getRedirectDestination = catchAsync(async (req, res, next) => {
  let currentProject;
  if (req.params.projectId) {
    currentProject = await Project.findById(req.params.projectId);
  } else {
    currentProject = await Project.findOne({
      domain: req.host,
    });
  }

  if (!currentProject) {
    return next();
  }

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

  const clientPlatform = detectClientPlatform(req);

  const redirectURL = urlFactory.buildRedirectUrl(
    deeplink,
    clientPlatform,
    req.query,
  );

  res.status(200).render('base', {
    project: currentProject,
    alias: req.params.alias,
    query: req.query,
    client: clientPlatform,
    deeplink: deeplink,
    redirectURL: redirectURL,
  });
});
