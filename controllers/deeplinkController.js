const Deeplink = require('../models/deeplinkModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createDeeplink = factory.createOne(Deeplink);
exports.getAllDeeplinks = factory.getAll(Deeplink, (req) =>
  req.params.projectId ? { project: req.params.projectId } : {},
);
exports.getDeeplinkById = factory.getOne(Deeplink);
exports.updateDeeplink = factory.updateOne(Deeplink);
// exports.updateDeeplink = (req, res, next) => {
//   console.log('Update called');
//   console.log(req.body);
//   res.status(200).json({
//     status: 'success',
//   });
// };

exports.getDeeplinkByAlias = catchAsync(async (req, res, next) => {
  if (!req.params.projectId || !req.params.alias) {
    return next(
      new AppError('Please provide projectId and deeplink alias!', 400),
    );
  }

  const deeplink = await Deeplink.findOne({
    project: req.params.projectId,
    alias: req.params.alias,
  });

  if (!deeplink) {
    return next(new AppError('No deeplink found with that alias', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      deeplink,
    },
  });
});
