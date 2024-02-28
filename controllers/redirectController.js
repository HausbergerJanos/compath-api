const path = require('path');
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
  })
    .populate('project')
    .select(
      'title description alias linkParams androidRedirectSettings iosRedirectSettings desktopRedirectSettings defaultRedirectSettings redirectBehavior campaignSettings socialLinkAttributes fullLink',
    );

  if (!deeplink) {
    // Use project's redirectURL as fallback
    deeplink = {
      defaultRedirectSettings: {
        redirectURL: currentProject.defaultRedirectURL,
      },
      title: currentProject.name,
      description: '',
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

exports.getAssetlinks = catchAsync(async (req, res, next) => {
  res.sendFile(
    path.join(__dirname, 'resources', 'public', 'assets', 'assetlinks.json'),
  );
});
