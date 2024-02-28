const path = require('path');
const Deeplink = require('../models/deeplinkModel');
const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const urlFactory = require('./redirectUrlFactory');
const { detectClientPlatform } = require('../utils/userAgentUtils');
const AppError = require('../utils/appError');

exports.getRedirectDestination = catchAsync(async (req, res, next) => {
  console.log('Bingoo');
  let currentProject;
  if (req.params.projectId) {
    currentProject = await Project.findById(req.params.projectId);
  } else {
    currentProject = await Project.findOne({
      'redirectClientMeta.domain': req.host,
    });
  }

  if (!currentProject) {
    return next(
      new AppError('No domain found with that project name or id', 404),
    );
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

exports.test = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: 'success',
  });
});
