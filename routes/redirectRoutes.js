const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router({ mergeParams: true });

// These routes are final
router.route('/').get(redirectController.getRedirectDestination);
router.route('/:alias').get(redirectController.getRedirectDestination);

module.exports = router;
