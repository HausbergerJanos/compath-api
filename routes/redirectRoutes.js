const express = require('express');
const redirectController = require('../controllers/redirectController');
//const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/:alias').get(
  //authController.protectWithRedirectClientToken,
  redirectController.getRedirecURL,
);

router.route('/:alias/params').get(redirectController.getRedirectParams);

module.exports = router;
