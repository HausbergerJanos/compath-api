const Project = require('../models/projectModel');
//const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllProjects = factory.getAll(Project);
exports.createProject = factory.createOne(Project);
