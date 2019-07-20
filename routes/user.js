const router = require('express').Router();
const user = require('../controllers/user');

router.post('/', user.insert);

module.exports = router;