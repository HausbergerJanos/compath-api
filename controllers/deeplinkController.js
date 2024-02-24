const Deeplink = require('../models/deeplinkModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const serialization = require('../utils/serialization');
const { detectClientPlatform } = require('../utils/userAgentUtils');
const AppError = require('../utils/appError');
const urlFactory = require('./redirectUrlFactory');

exports.createDeeplink = factory.createOne(Deeplink);
exports.getAllDeeplinks = factory.getAll(Deeplink, (req) =>
  req.params.projectId ? { project: req.params.projectId } : {},
);
exports.getDeeplinkById = factory.getOne(Deeplink);
exports.updateDeeplink = factory.updateOne(Deeplink);
exports.deleteDeeplink = factory.deleteOne(Deeplink);

exports.getDeeplinkParmas = catchAsync(async (req, res, next) => {
  const deeplink = await Deeplink.findOne({
    project: req.params.projectId,
    alias: req.params.alias,
  }).select(
    'alias linkParams androidRedirectSettings iosRedirectSettings desktopRedirectSettings defaultRedirectSettings',
  );

  if (!deeplink) {
    return next(
      new AppError('No deeplink found with that alias or project id!', 404),
    );
  }

  const clientPlatform = req.query.platform
    ? req.query.platform
    : detectClientPlatform(req);

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
      redirectUrl: urlFactory.getRedirectUrlForInstalledMobilClients(
        deeplink,
        clientPlatform,
      ),
    },
  });
});
