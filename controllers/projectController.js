const Project = require('../models/projectModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const container = require('../di/module');

const { cloudProvider } = container.cradle;

exports.getAllProjects = factory.getAll(Project, (req) => {
  // TODO - Handle super admins here. He need access all projects
  const projectIds = req.user.projects.map(
    (projectWithRole) => projectWithRole.project,
  );
  return { _id: { $in: projectIds } };
});

exports.getProject = factory.getOne(Project, null, true);

exports.createProject = catchAsync(async (req, res, next) => {
  const { user } = req;
  if (!user || !user.email) {
    return next(
      new AppError('User email is required to create a project', 400),
    );
  }
  const project = await Project.create({
    name: req.body.name,
    // androidClient: {
    //   packageId: req.body.androidClient.packageId,
    // },
    // defaultRedirectURL: req.body.defaultRedirectURL,
    members: [req.user.id],
    contactEmail: user.email,
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
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that id', 404));
  }

  const isMember = project.members.some(
    (member) => member.toString() === req.user.id,
  );
  if (!isMember) {
    return next(
      new AppError('You do not have access to delete this project', 403),
    );
  }

  await Project.findByIdAndDelete(req.params.id);

  await User.updateOne(
    { _id: req.user.id },
    { $pull: { projects: { project: req.params.id } } },
  );

  await cloudProvider.deleteRedirectClient(project);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
