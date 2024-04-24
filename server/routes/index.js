
const router = require('express').Router();

router.use('/api/obs', require('./api/obs'));
router.use('/api/litra', require('./api/litra'));

module.exports = router;
