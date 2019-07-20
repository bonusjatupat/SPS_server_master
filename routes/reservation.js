const router = require('express').Router();
const reservation = require('../controllers/reservation');

router.get('/', reservation.list)
    .get('/:id', reservation.listOne)
    .patch('/:id', reservation.update)
    .delete('/:id', reservation.delete)
    .post('/', reservation.insert);
    
module.exports = router;