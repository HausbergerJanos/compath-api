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

module.exports = router;
