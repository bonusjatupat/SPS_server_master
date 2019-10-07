//const exporess = require('express').Router();
const mongoose = require('mongoose');
const moment = require('moment');
const Reservation = require('../models/reservation');

exports.list = (req,res) => {
    console.log('get reservation');
    Reservation.find()
        .exec()
        .then(docs => {
            console.log(docs);
            if(docs.length > 0) {
                res.status(200).json(docs);
            }else{
                res.status(200).json('No entries found');
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.listOne = (req,res) => {
    const id = req.params.id;
    Reservation.findById(id)
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if(doc){
                res.status(200).json(doc);
            } else {
                res.status(404).json({message: "No valid entry found"});
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).json({
                error: err
            });
        });
}

exports.update = (req,res) => {
    const id = req.params.id;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Reservation.update({ _id: id}, { $set: updateOps})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}

exports.delete = (req,res) => {
    const id = req.params.id;
    Reservation.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.insert = (req, res) => {
    const reservation = new Reservation({
        _id: new mongoose.Types.ObjectId,
        bookingID: req.body._id,
        userID: req.body.userID,
        parkingID: req.body.parkingID,
        slotID: req.body.slotID,
        building: req.body.building,
        floor: req.body.floor,
        slotNumber: req.body.slotNumber,
        reservationInfo: {
            date: req.body.reservationInfo.date,
            time: req.body.reservationInfo.time
        },
        arrivalTime: req.body.arrivalTime,
        realArrivalTime: "",
        price: req.body.price,
        status: "pending"
    });

    reservation.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Handling POST requests to /reservations",
                createdReservation: result
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.updateStatus = (req, res) => {
    const bookingID = req.params.bookingId;
    const userID = req.params.userId;
    const status = req.params.status;

    Reservation.update({'bookingID': bookingID, 'userID': userID},
        {$set: {
            'realArrivalTime': moment().format('HH:mm'),
            'status': status
        }})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        }); 
}

exports.updatePrice = (req, res) => {
    const bookingID = req.params.bookingId;
    const price = req.params.price;

    Reservation.findOne({'bookingID': bookingID})
        .exec()
        .then(doc => {
            var oldPrice = doc.price;
            Reservation.update({'bookingID': bookingID},
                {$set: {
                    'price': oldPrice + price
                }})
                .exec()
                .then(result => {
                    console.log(result);
                    res.status(200).json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    })
                }); 
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}

