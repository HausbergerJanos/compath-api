const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router({ mergeParams: true });

router.route('/').get(redirectController.getRedirectInfo);
router.route('/:alias').get(redirectController.getRedirectInfo);

router.route('/:alias/params').get(redirectController.getRedirectParams);

module.exports = router;
