
const router = require('express').Router();

router.delete('/wakeup/:pizza', (async function(req, res)
{
	res.end();
}));

module.exports = router;
