const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router({ mergeParams: true });

// These routes are final
router.route('/').get(redirectController.getRedirectDestination);
router.route('/:alias').get(redirectController.getRedirectDestination);

// TODO remove to deeplink router
router.route('/:alias/params').get(redirectController.getRedirectParams);

module.exports = router;
