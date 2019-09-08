const moment = require('moment');
const User = require('../models/user');
const Parking = require('../models/parking');
const Reservation = require('../models/reservation');
const mongoose = require('mongoose');

//get floors to show in the choosing floor page
exports.parkingFloor = (req,res) => {
    const userID = req.params.userID;
    const parkingID = req.params.parkingID;
    
    //query the floors' information and price
    var price = 0;
    var result = {
        numberFloor: 0,
        floors: []
    }
    Parking.findById(parkingID).exec()
        .then(doc => {
            result.numberFloor = doc.numberFloor;
            price = doc.price.paid.rate;
                  
            for(var i=0; i<doc.floor.length; i++){
                result.floors.push(doc.floor[i]);
            };

            User.findById(userID).exec()
                .then(doc => {
                    if(doc.balance >= price*2){
                        res.status(200).json(result);
                    } else {
                        res.status(200).json("Your balance is not enough");
                    }
                })
                .catch(err => { res.status(400).json({ error: err });   
                });
            })
        .catch(err => { res.status(400).json({ error: err });   
        });
    
    //check user's balance before showing the floor number and it's facilities
    /*User.findById(userID).exec()
        .then(doc => {
            if(doc.balance >= price*2){
                res.status(200).json(result);
            } else {
                res.status(200).json("Your balance is not enough");
            }
        })
        .catch(err => { res.status(400).json({ error: err });   
        });*/
}

//get reserve information (output = .json)
exports.reserveInformation = (req,res) => {
    const userID = req.params.userID;
    const parkingID = req.params.parkingID;
    const floor = parseInt(req.params.floor); 

    //get slot number
    var tempReserveInfo = {
        _id: new mongoose.Types.ObjectId(),
        userID: userID,
        parkingID: parkingID,
        slotID: "",
        building: "",
        floor: "",
        slotNumber: "",
        reservationInfo: {
            date: moment().format('DD-MM-YYYY'),
            time: moment().format('HH:mm')
        },
        arrivalTime: moment().add(1, 'hours').format('HH:mm'),
        realArrivalTime: "",
        price: 0
    }

    var slots = [], price = 0;
    Parking.findById(parkingID).exec()
        .then(doc => {
            price = doc.price.paid.rate;

            for(var i=0; i<doc.slot.length; i++){
                if(doc.slot[i].floor == floor && doc.slot[i].available == "available"){
                    slots.push(doc.slot[i]);
                    break;
                }
            };
            
            tempReserveInfo.slotID = slots[0]._id;
            tempReserveInfo.building = slots[0].building;
            tempReserveInfo.floor = slots[0].floor;
            tempReserveInfo.slotNumber = slots[0].slotNumber;
            tempReserveInfo.price = price;

            res.json(tempReserveInfo);
        })
        .catch(err => { res.status(400).json({ error: err });   
        });
}

//add 1 hour and update price, reservation status when user's late and want to continue reserving
exports.addAdditionalHour = (req, res) => {
    const id = req.params.reservationID;

    var priceParking = 0;
    var price = 0;
    var updatedPrice = 0;
    Reservation.findById(id)
        .exec()
        .then(doc => {
            if(doc){
                price = doc.price;
                Parking.findById(doc.parkingID)
                    .exec()
                    .then(doc => {
                        if(doc){
                            priceParking = doc.price.paid.rate;
                            updatedPrice = priceParking + price;
                            Reservation.updateOne({ _id: id}, { 
                                $set: {
                                    arrivalTime: moment().add(1, 'hours').format('HH:mm:ss'),
                                    status: "late",
                                    price: updatedPrice
                                }})
                                .exec()
                                .then(result => {
                                    console.log("update reservation success");
                                    res.status(200).json(result);
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    })
                                });
                        }else{
                            res.status(404).json({message: "No parking entry found"});
                        }
                    })
            } else {
                res.status(404).json({message: "No reservation found"});
            }
        })
        .catch(err => {
            res.status(400).json({
                error: err
            });
        });
}

//with json from hardware
//update slot.available = reserved/available/parking, floor.slotAvailable, numberSlot.used.type 
//(Gate is closed, red light's on) (Gate is opened, green light's on) (Gate is opened and car is park, blue light's on)
//Action = reserved , parked

/*slot: {
    _id: "56546856",
	slotSensor: false,
		slotBarrier: {
			green: false,
			red: true,
			blue: false
		}
}*/

exports.updateSlotAfterReservation = (req, res) => {
    const userID = req.params.userID;
    const reservationID = req.params.reservationID;
    const status = req.params.status; //changeReserved, changeParking
    
    //get hardware status via json
    let slotIDFromHardware = req.body.slot._id;
    let slotSensor = req.body.slot.slotSensor;
    let greenLight = req.body.slot.slotBarrier.green;
    let redLight = req.body.slot.slotBarrier.red;
    let blueLight = req.body.slot.slotBarrier.blue;
    let available = " ";

    if(!slotSensor && greenLight && !redLight && !blueLight){
        available = "available";
    } else if(!slotSensor && !greenLight && redLight && !blueLight) {
        available = "reserved";
    } else if(slotSensor && !greenLight && !redLight && blueLight){
        available = "parking";
    }

    var parkingID = " ";
    var slotID = " ";

    //update slotAvailable from available -> reserved
    if(status == "changeReserved" && available == "reserved"){
        Reservation.findOne({'_id': reservationID, 'userID': userID})
            .exec()
            .then(doc => {
                if(doc){
                    parkingID = doc.parkingID;
                    slotID = doc.slotID;
                    console.log(slotID);
                    if(slotID == slotIDFromHardware){
                        Parking.updateOne({'_id': parkingID, 'slot._id': slotID},
                            {$set: {
                                slot: {
                                    slotSensor: slotSensor,
                                    slotBarrier: {
                                        green: greenLight,
                                        red: redLight,
                                        blue: blueLight
                                    },
                                    available: "reserved",
                                    lastUpdate: new Date()  
                                }
                            }})
                            .exec()
                            .then(result => {res.status(200).json("update success " + result);})
                            .catch(err => {res.status(500).json({error: err}) 
                        }); 
                    }else{
                        res.status(404).json({message: "SlotID not match"});
                    }
                }else{
                    res.status(404).json({message: "No reservation found"});
                }
            })
            .catch(err => {res.status(500).json({error: err})});
    }else if(status == "changeParking"){
        
    }

}








