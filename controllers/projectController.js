const Project = require('../models/projectModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const container = require('../di/module');

const { cloudProvider } = container.cradle;

exports.getAllProjects = factory.getAll(Project);

exports.createProject = catchAsync(async (req, res, next) => {
  const project = await Project.create({
    name: req.body.name,
    androidClient: {
      packageId: req.body.androidClient.packageId,
    },
    defaultRedirectURL: req.body.defaultRedirectURL,
    members: [req.user.id],
  });
  await cloudProvider.createAndDeployRedirectClient(project);

  // Add project to user and set owner role
  await User.findByIdAndUpdate(req.user.id, {
    $push: { projects: { project: project.id, role: 'owner' } },
  });

  res.status(201).json({
    status: 'success',
    project,
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that id', 404));
  }

  await cloudProvider.deleteRedirectClient(project);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
