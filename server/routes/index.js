
const router = require('express').Router();

router.use('/api/obs', require('./api/obs'));
router.use('/api/litra', require('./api/litra'));
router.use('/api/screenshot', require('./api/screenshot'));

module.exports = router;
