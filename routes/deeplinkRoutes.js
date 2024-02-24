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
  .patch(deeplinkController.updateDeeplink)
  .delete(deeplinkController.deleteDeeplink);

router.route('/:alias/params').get(deeplinkController.getDeeplinkParmas);

module.exports = router;
