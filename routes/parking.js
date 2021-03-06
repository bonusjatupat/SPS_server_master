const router = require('express').Router();
const parking = require('../controllers/parking');

router.get('/', parking.list)
    .get('/:id', parking.listOne)
    .post('/', parking.insert)
    .patch('/:id/insertSlot', parking.insertSlot)
    .put('/:id/insertFloor', parking.insertFloor)
    .get('/find/:lat/:long', parking.nearBy)
    .patch('/:parkingId/:slotId/updateSlotAvailable', parking.updateSlotAvailable)
    //.delete('/:parkingId/:slotId/deleteSlot', parking.deleteSlot)
    .get('/:parkingId/:slotId/getSlot', parking.getSlot)
    .put('/:parkingId/:slotId/updateSlotAvailable', parking.updateSlotAvailablePut);

module.exports = router;
