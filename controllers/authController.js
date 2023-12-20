const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.protectWithRedirectClientToken = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Redirect authorization token is missing!', 401));
  }

  // 2) Token verification
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_REDIRECT_CLIENT_SECRET,
  );

  // 3) Check if project still exists
  const currentProject = await Project.findById(decoded.id);
  if (!currentProject) {
    return next(
      new AppError(
        'The project belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUT
  req.project = currentProject;
  next();
});
