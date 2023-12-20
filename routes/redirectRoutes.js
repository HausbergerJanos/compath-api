const express = require('express');
const redirectController = require('../controllers/redirectController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/:alias')
  .get(
    authController.protectWithRedirectClientToken,
    redirectController.getRedirecURL,
  );

module.exports = router;
