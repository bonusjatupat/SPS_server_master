const router = require('express').Router();
const parking = require('../controllers/parking');

router.get('/', parking.list)
    .get('/:id', parking.listOne)
    .post('/', parking.insert)
    .patch('/:id/insertSlot', parking.insertSlot)
    .put('/:id/insertFloor', parking.insertFloor)
    .patch('/:parkingId/:slotId/updateSlotAvailable', parking.updateSlotAvailable);
    //.delete('/:parkingId/:slotId/deleteSlot', parking.deleteSlot)
    //.get('/:parkingId/:slotId/getSlot', parking.getOneSlot);

module.exports = router;
