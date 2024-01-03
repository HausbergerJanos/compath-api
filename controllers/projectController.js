const path = require('path');
const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const awsController = require('./awsController');
const fileUtils = require('../utils/fileUtils');
const AppError = require('../utils/appError');

exports.getAllProjects = factory.getAll(Project);

exports.createProject = catchAsync(async (req, res, next) => {
  const project = await Project.create(req.body);

  const bucketName = await awsController.createBucket(project.slug);

  project.redirectClientMeta.bucketName = bucketName;
  await project.save();

  await fileUtils.createBucketSourceDirectory(project);
  await awsController.uploadDirectory(
    bucketName,
    path.join('dev-data', 'temporary', bucketName),
  );
  await fileUtils.deleteDirectory(
    path.join('dev-data', 'temporary', bucketName),
  );

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

  await awsController.deleteBucket(project.redirectClientMeta.bucketName);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
