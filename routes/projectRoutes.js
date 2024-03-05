const express = require('express');
const deeplinkRouter = require('./deeplinkRoutes');
const redirectRouter = require('./redirectRoutes');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /projects/657da1b07538c2145e5166df/deeplinks
// GET /projects/657da1b07538c2145e5166df/deeplinks
// TODO
router.use('/:projectId/deeplinks', deeplinkRouter);

// This route is final
router.use('/:projectId/redirects', redirectRouter);

// These routes are final
router
  .route('/')
  .get(projectController.getAllProjects)
  .post(authController.protect, projectController.createProject);

// This route is final
router.route('/:id').delete(projectController.deleteProject);

module.exports = router;
