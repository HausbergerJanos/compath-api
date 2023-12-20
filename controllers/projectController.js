const jwt = require('jsonwebtoken');

const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllProjects = factory.getAll(Project);
//exports.createProject = factory.createOne(Project);

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_REDIRECT_CLIENT_SECRET);

exports.createProject = catchAsync(async (req, res, next) => {
  const project = await Project.create(req.body);

  const token = signToken(project._id);

  res.status(201).json({
    status: 'success',
    token,
    project,
  });
});
