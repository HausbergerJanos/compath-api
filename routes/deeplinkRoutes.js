const express = require('express');
const deeplinkController = require('../controllers/deeplinkController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(deeplinkController.getAllDeeplinks)
  .post(deeplinkController.createDeeplink);

router
  .route('/:id')
  .get(deeplinkController.getDeeplinkById)
  .patch(deeplinkController.updateDeeplink);

router.route('/alias/:alias').get(deeplinkController.getDeeplinkByAlias);

module.exports = router;
