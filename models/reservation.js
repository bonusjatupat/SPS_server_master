const mongoose = require('mongoose');
//const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

var Reservation = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bookingID: String,
    userID: String,
    parkingID: String,
    slotID: String,
    building: String,
    floor: String,
    slotNumber: String,
    reservationInfo: {
        date: String,
        time: String 
    },
    arrivalTime: String,
    realArrivalTime: String,
    price: Number,
    status: String //"cancelled", "successed", "pending"
});

module.exports = mongoose.model('SPS_reservations', Reservation);