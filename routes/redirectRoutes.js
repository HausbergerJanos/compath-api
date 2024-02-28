const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router({ mergeParams: true });

// These routes are final
router.route('/').get(redirectController.getRedirectDestination);
//router.route('/').get(redirectController.test);
router.route('/:alias').get(redirectController.getRedirectDestination);

router
  .route('/.well-known/assetlinks.json')
  .get(redirectController.getAssetlinks);

module.exports = router;
