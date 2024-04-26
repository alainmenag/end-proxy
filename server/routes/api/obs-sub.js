
const router = require('express').Router();

const obsSubSub = require('./obs-sub-sub.js');

router.post('/restart', (async function(req, res)
{
	res.end();
}));

router.use('/group', obsSubSub);

module.exports = router;
