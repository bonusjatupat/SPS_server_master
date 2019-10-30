const router = require('express').Router();
const user = require('../controllers/user');

router.get('/', user.list)
    .get('/:id', user.listOne)
    .get('/:email/:password/signInLocal', user.signInLocal)
    .post('/signup/email_exists', user.signUpCheckEmailExists)
    .post('/', user.addUserLocal)
    .patch('/:userId/:amount/updateBalance', user.updateBalance);

module.exports = router;