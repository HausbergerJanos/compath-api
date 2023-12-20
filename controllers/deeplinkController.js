const Deeplink = require('../models/deeplinkModel');
const factory = require('./handlerFactory');

exports.createDeeplink = factory.createOne(Deeplink);
exports.getAllDeeplinks = factory.getAll(Deeplink, (req) =>
  req.params.projectId ? { project: req.params.projectId } : {},
);
exports.getDeeplinkById = factory.getOne(Deeplink);
exports.updateDeeplink = factory.updateOne(Deeplink);
exports.deleteDeeplink = factory.deleteOne(Deeplink);
