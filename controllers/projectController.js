const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const container = require('../di/module');

const { cloudProvider } = container.cradle;

exports.getAllProjects = factory.getAll(Project);

exports.createProject = catchAsync(async (req, res, next) => {
  const project = await Project.create(req.body);
  await cloudProvider.createAndDeployRedirectClient(project);

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
