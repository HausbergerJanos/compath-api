const Deeplink = require('../models/deeplinkModel');
const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const urlFactory = require('./redirectUrlFactory');
const { detectClientPlatform } = require('../utils/userAgentUtils');
const AppError = require('../utils/appError');
const { getAssetFromS3 } = require('./cloud/aws/s3Controller');

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
  let currentProject;
  if (req.query.projectId) {
    currentProject = await Project.findById(req.query.projectId);
  } else {
    currentProject = await Project.findOne({
      domain: req.hostname,
    });
  }

  if (!currentProject) {
    return next(
      new AppError('No domain found with that project name or id', 404),
    );
  }

  const { bucketName } = currentProject.redirectConfig;
  const key = 'assetlinks.json'; // Replace with the path to your file

  const fileStream = await getAssetFromS3(bucketName, key);

  fileStream.pipe(res).on('error', () => {
    res.status(500).send('Error retrieving the file');
  });

  res.setHeader('Content-Type', 'application/json');
});

exports.test = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: 'success',
  });
});
