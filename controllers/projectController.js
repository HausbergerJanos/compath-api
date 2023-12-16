const catchAsync = require('../utils/catchAsync');

exports.getAllProjects = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome in the API!',
  });
});
