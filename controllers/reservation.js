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
        _id: req.body._id,
        userID: req.body.userID,
        parkingID: req.body.parkingID,
        slotID: req.body.slotID,
        building: req.body.building,
        floor: req.body.floor,
        slotNumber: req.body.slotNumber,
        reservationInfo: {
            date: moment().format('DD-MM-YYYY'),
            time: moment().format('HH:mm:ss')
        },
        arrivalTime: moment().add(1, 'hours').format('HH:mm:ss'),
        realArrivalTime: "",
        price: req.body.price,
        status: "onTime"
    });

    reservation.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
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

