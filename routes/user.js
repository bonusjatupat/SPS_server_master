const router = require('express').Router();
const user = require('../controllers/user');

router.get('/', user.list)
    .get('/:id', user.listOne)
    .get('/:email/:password/signInLocal', user.signInLocal)
    .post('/', user.addUserLocal);

module.exports = router;