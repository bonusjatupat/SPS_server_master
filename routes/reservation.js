const router = require('express').Router();
const reservation = require('../controllers/reservation');

router.get('/', reservation.list)
    .get('/:id', reservation.listOne)
    .patch('/:id', reservation.update)
    .delete('/:id', reservation.delete)
    .post('/', reservation.insert)
    .patch('/:bookingId/:userId/:status/updateStatus', reservation.updateStatus)
    .patch('/:bookingId/:price/updatePrice', reservation.updatePrice);
    
module.exports = router;