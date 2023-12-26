const express = require('express');
const deeplinkRouter = require('./deeplinkRoutes');
const redirectRouter = require('./redirectRoutes');
const projectController = require('../controllers/projectController');

const router = express.Router();

// POST /projects/657da1b07538c2145e5166df/deeplinks
// GET /projects/657da1b07538c2145e5166df/deeplinks
router.use('/:projectId/deeplinks', deeplinkRouter);
router.use('/:projectId/redirects', redirectRouter);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(projectController.createProject);

module.exports = router;
