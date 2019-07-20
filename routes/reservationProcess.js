const router = require('express').Router();
const reservationProcess = require('../controllers/reservationProcess');

router.get('/:userID/:parkingID/checkParkingFloor', reservationProcess.parkingFloor)
    .get('/:userID/:parkingID/:floor/reserveInformation', reservationProcess.reserveInformation)
    .patch('/:reservationID/addTime', reservationProcess.addAdditionalHour)
    .patch('/:userID/:reservationID/:status/updateSlotAfterReservation', reservationProcess.updateSlotAfterReservation);

    
module.exports = router;