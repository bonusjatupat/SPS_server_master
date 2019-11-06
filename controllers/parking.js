const mongoose = require('mongoose');
const Parking = require('../models/parking');
//const upload = require('../misc/upload');

exports.list = (req, res) => {
    console.log('gettttt');
    Parking.find((err, parking) => {
      if (err) {
			res.status(400).send({ error: err });
		} else {
			res.json({ parking: parking });
		}
    });
}

exports.listOne = (req, res) => {
    Parking.findById(req.params.id, (err, parking) => {
		if (err) {
			res.status(400).send({ error: err });
		} else {
			res.status(200).json({ parking: parking });
		}
    });
}

/*exports.insert = (req, res) => {
    console.log('inserting parking lot');
    const parking = new Parking({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        description: req.body.description,
        address: {
            description: req.body.address.description,
            location: {
                type: "Point",
			    coordinates: { type: [req.body.address.location.coordinates.type] }
            }
        },
        photos: req.body.photos,
        contact: {
            type: req.body.contact.type,
            value: req.body.contact.value
        },
        sensorSupportted: true,
        numberBuilding: req.body.numberBuilding,
        numberFloor: req.body.numberFloor,
        numberSlot: {
            total: req.body.numberSlot.total,
            used: 0
        },
        facility: req.body.facility,
        type: req.body.type,
        price: {
            free: {
                hour: req.body.price.free.hour
            },
            paid: {
                rate: req.body.price.paid.rate,
                per: req.body.price.paid.per
            }
        },
        visible: true
    });

    parking.save()
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
}*/

exports.insert = (req,res) => {
    upload.parkingPhotos(req, res, (error) => {
        console.log(req.body.address.location.coordinates)
        var newPost = {
            _id: new mongoose.Types.ObjectId,
            name: req.body.name,
            description: req.body.description,
            address: {
                description: req.body.address.description,
                location: {
                    type: "Point",
                    coordinates: req.body.address.location.coordinates
                }
            },
            sensorSupportted: true,
            numberBuilding: req.body.numberBuilding,
            numberFloor: req.body.numberFloor,
            numberSlot: {
                total: 0,
                used: 0
            },
            facility: req.body.facility,
            type: req.body.type,
            price: {
                free: {
                    hour: req.body.price.free.hour
                },
                paid: {
                    rate: req.body.price.paid.rate,
                    per: req.body.price.paid.per
                }
            },
            visible: true,
            spsSupported: req.body.spsSupported
        };

/*        if (!error) {
            var photos = [];
            console.log(req.body.photos)
			req.body.photos.map((photo, key) => {
				upload.imageResizer(photo.path, (err, success) => {
					if (!err) {
						photos.push(photo.filename);
					}
				});
			});
			newPost.photos = photos;
		} else {
			console.log(error);
        }
*/
        
        let newParking = new Parking(newPost);
		newParking.save((err, parking) => {
			if (err) {
				res.status(400).send({ error: err });
			} else {
				res.json({ parking: parking });
			}
		})
    });
}

exports.insertSlot = (req,res) => {
    const parkingId = req.params.id;
    const slotSensor = req.body.slot.slotSensor;
    let greenLight = req.body.slot.slotBarrier.green;
    let redLight = req.body.slot.slotBarrier.red;
    let blueLight = req.body.slot.slotBarrier.blue;
    let available = "";
    
    //sensor = false & green = true => available
    //sensor = false & red = true => reserved
    //sensor = true & blue = true => parking
    if(!slotSensor && greenLight && !redLight && !blueLight){
        available = "available";
    } else if(!slotSensor && !greenLight && redLight && !blueLight) {
        available = "reserved";
    } else if(slotSensor && !greenLight && !redLight && blueLight){
        available = "parking";
    }

    var slotInFloor = 0;
    var slotAvailableInFloor = 0;
    var slotInUse = 0;
    var slotNum = 0;

    //ต้องเทียบค่า floor number กับ floor ของslotที่จะaddด้วย
    //get original values & update slotNumber & update slot in floor
    Parking.findOne({'_id': parkingId})
        .exec()
        .then(doc => {
            slotNum = doc.numberSlot.total+1;
            if(available == "available"){
                slotInUse = doc.numberSlot.used;
            }else{
                slotInUse = doc.numberSlot.used+1;
            }

            for(var i=0; i<doc.floor.length; i++){
                if(doc.floor[i].floorNumber = req.body.slot.floor){
                    slotInFloor = doc.floor[i].slotTotal+1;
                    if(available == "available"){
                        slotAvailableInFloor = doc.floor[i].slotAvailable+1;
                    }else{
                        slotAvailableInFloor = doc.floor[i].slotAvailable;
                    }
                    break;
                }
            };

            console.log("slotNum = "+slotNum);
            console.log("slotInUse = "+slotInUse);
            console.log("slotInFloor = "+slotInFloor);
            console.log("slotAvailableInFloor = "+slotAvailableInFloor);

            Parking.updateOne({'_id': parkingId},
                {$set: {
                    numberSlot: {
                        total: slotNum,
                        used: slotInUse
                    }
                }}).exec().then(result => {console.log(result)}).catch(err => res.status(404).json(err)); 
                
            Parking.updateOne({'_id': parkingId, 'floor.floorNumber': req.body.slot.floor}, {
                $set: {
                    'floor.$.slotTotal': slotInFloor,
                    'floor.$.slotAvailable': slotAvailableInFloor
                }})
                .exec().then(result => {console.log(result)}).catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json({message: "No parking, floor found"}));

    //add slot and set number slots
    Parking.updateOne({_id: parkingId}, 
        {$push: {
            slot: {
                    slotNumber: req.body.slot.slotNumber,
                    building: req.body.slot.building,
                    floor: req.body.slot.floor,
                    slotSensor: slotSensor,
                    slotBarrier: {
                        green: greenLight,
                        red: redLight,
                        blue: blueLight
                    },
                    available: available,
                    lastUpdate: new Date()    
            }
        }})
        .exec().then(result => {res.status(200).json(result)}).catch(err => res.status(404).json(err))
}

//update numberFloor ด้วย
exports.insertFloor = (req,res) => {
    const parkingId = req.params.id;
    Parking.update({_id: parkingId},
        {$push: {
            floor: {
                floorNumber: req.body.floor.floorNumber,
                facilities: req.body.floor.facilities,
                slotTotal: 0,
                slotAvailable: 0
            }
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

//ต้อง update ใน numberSlot กับ floor ด้วย
exports.updateSlotAvailable = (req,res) => {
    const parkingId = req.params.parkingId;
    let slotId = req.params.slotId;
    let slotSensor = req.body.slotSensor;
    let greenLight = req.body.slotBarrier.green;
    let redLight = req.body.slotBarrier.red;
    let blueLight = req.body.slotBarrier.blue;
    let available = "";

    if(!slotSensor && greenLight && !redLight && !blueLight){
        available = "available";
    } else if(!slotSensor && !greenLight && redLight && !blueLight) {
        available = "reserved";
    } else if(slotSensor && !greenLight && !redLight && blueLight){
        available = "parking";
    }

    var slotAvailableInFloor = 0;
    var slotInUse = 0;
    var slotNum = 0;

    //reserved, parking -> available : numberSlot.used--, floor.slotAvailable++
    //available -> reserved : numberSlot.used++, floor.slotAvailable--
    //reserved -> parking : ไม่เปลี่ยน
    if(available == "available" || available == "reserved"){
        Parking.findOne({'_id': parkingId})
            .exec()
            .then(doc => {
                slotNum = doc.numberSlot.total
                
                if(available == "available"){
                    slotInUse = doc.numberSlot.used - 1
                    for(var i=0; i<doc.floor.length; i++){
                        if(doc.floor[i].floorNumber = req.body.floor){
                            slotAvailableInFloor = doc.floor[i].slotAvailable+1;
                            break;
                        }
                    };
                }else if(available == "reserved"){
                    slotInUse = doc.numberSlot.used + 1
                    for(var i=0; i<doc.floor.length; i++){
                        if(doc.floor[i].floorNumber = req.body.floor){
                            slotAvailableInFloor = doc.floor[i].slotAvailable - 1;
                            break;
                        }
                    };
                }

                console.log("slotInUse = "+slotInUse);
                console.log("slotAvailableInFloor = "+slotAvailableInFloor);

                Parking.updateOne({'_id': parkingId}, {
                    $set: {
                    numberSlot: {
                            total: slotNum,
                            used: slotInUse
                        }
                    }}).exec().then(result => {console.log(result)}).catch(err => res.status(404).json(err)); 
                    
                Parking.updateOne({'_id': parkingId, 'floor.floorNumber': req.body.floor}, {
                    $set: {
                        'floor.$.slotAvailable': slotAvailableInFloor
                    }})
                    .exec().then(result => {console.log(result)}).catch(err => res.status(404).json(err));
            })
            .catch(err => res.status(404).json({message: "No parking, floor found"}));
    }

    console.log(greenLight);
    Parking.updateOne({'_id': parkingId, 'slot._id': slotId},
        {$set: {
            'slot.$.slotSensor': slotSensor,
            'slot.$.slotBarrier.green': greenLight,
            'slot.$.slotBarrier.red': redLight,
            'slot.$.slotBarrier.blue': blueLight,
            'slot.$.available': available,
            'slot.$.lastUpdate': new Date()
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

exports.nearBy = (req, res) => {
    // Input: Latitude, Longitude
    // Output: Near Parking Places with the maximum distance of 1km.
    const maxDistance = 1;
	Parking.find({
		"address.location": {
			$geoWithin:
				{
					$centerSphere:
						[[req.params.long, req.params.lat],
						maxDistance / 6371]
				}
		}
	}, (err, parking) => {
		if (err) {
			res.status(400).send({ error: err });
		} else {
			var counter = 0;
			var parkingData = [];
			var newParking = {}
			//var slotCounter = {}
			for (const item of parking) {
				newParking = JSON.parse(JSON.stringify(item)); // Deep clone Object

				/*slotCounter = {
					availableSlot: -1,
					totalSlot: -1
				}
				if (newParking.slotSensor.length > 0) {
					slotCounter.availableSlot = newParking.slotSensor.filter((x) => { return x.available == true }).length;
					slotCounter.totalSlot = newParking.slotSensor.length;
				} else if (item.slot) {
					if (newParking.slot.total > 0) {
						slotCounter.availableSlot = newParking.slot.used;
						slotCounter.totalSlot = newParking.slot.total;
					} else {
						slotCounter.availableSlot = newParking.slot.used;
						slotCounter.totalSlot = newParking.slot.used;
					}		
				}
				delete newParking['slot'];
				delete newParking['slotSensor'];
				newParking.slotCounter = slotCounter;*/
				parkingData.push(newParking);

				if (counter == parking.length - 1) {
					res.json({ parking: parkingData });
				}
				counter++;
			}
		}
	});
}

/*exports.deleteSlot = (req,res) => {
    const parkingId = req.params.parkingId;
    const slotId = req.params.slotId;

    Parking.remove({'_id': parkingId, 'slot._id': slotId})
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
}*/

exports.getSlot = (req,res) => {
    const parkingId = req.params.parkingId;
    const slotId = req.params.slotId;

    var slot = {
        _id: "",
        slotBarrier: {
            green: "",
            red: "",
            blue: ""
        },
        slotNumber: 0,
        building: 0,
        floor: 0,
        slotSensor: "",
        available: "",
        lastUpdate: ""
    }

    console.log(slotId);
    Parking.findOne({_id: parkingId}).select({ slot: {$elemMatch: {_id: slotId}}})
    .exec()
    .then(result => {
        console.log(slot);
        
        slot._id = result.slot[0]._id;
        slot.slotBarrier.green = result.slot[0].slotBarrier.green;
        slot.slotBarrier.red = result.slot[0].slotBarrier.red;
        slot.slotBarrier.blue = result.slot[0].slotBarrier.blue;
        slot.slotNumber = result.slot[0].slotNumber;
        slot.building = result.slot[0].building;
        slot.floor = result.slot[0].floor;
        slot.slotSensor = result.slot[0].slotSensor;
        slot.available = result.slot[0].available;
        slot.lastUpdate = result.slot[0].lastUpdate;
        
        res.status(200).json(slot);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    }); 
}

exports.updateSlotAvailablePut = (req,res) => {
    const parkingId = req.params.parkingId;
    let slotId = req.params.slotId;
    let slotSensor = req.body.slotSensor;
    let greenLight = req.body.slotBarrier.green;
    let redLight = req.body.slotBarrier.red;
    let blueLight = req.body.slotBarrier.blue;
    let available = "";

    if(!slotSensor && greenLight && !redLight && !blueLight){
        available = "available";
    } else if(!slotSensor && !greenLight && redLight && !blueLight) {
        available = "reserved";
    } else if(slotSensor && !greenLight && !redLight && blueLight){
        available = "parking";
    }

    var slotAvailableInFloor = 0;
    var slotInUse = 0;
    var slotNum = 0;

    //reserved, parking -> available : numberSlot.used--, floor.slotAvailable++
    //available -> reserved : numberSlot.used++, floor.slotAvailable--
    //reserved -> parking : ไม่เปลี่ยน
    if(available == "available" || available == "reserved"){
        Parking.findOne({'_id': parkingId})
            .exec()
            .then(doc => {
                slotNum = doc.numberSlot.total
                
                if(available == "available"){
                    slotInUse = doc.numberSlot.used - 1
                    for(var i=0; i<doc.floor.length; i++){
                        if(doc.floor[i].floorNumber = req.body.floor){
                            slotAvailableInFloor = doc.floor[i].slotAvailable+1;
                            break;
                        }
                    };
                }else if(available == "reserved"){
                    slotInUse = doc.numberSlot.used + 1
                    for(var i=0; i<doc.floor.length; i++){
                        if(doc.floor[i].floorNumber = req.body.floor){
                            slotAvailableInFloor = doc.floor[i].slotAvailable - 1;
                            break;
                        }
                    };
                }

                console.log("slotInUse = "+slotInUse);
                console.log("slotAvailableInFloor = "+slotAvailableInFloor);

                Parking.updateOne({'_id': parkingId}, {
                    $set: {
                    numberSlot: {
                            total: slotNum,
                            used: slotInUse
                        }
                    }}).exec().then(result => {console.log(result)}).catch(err => res.status(404).json(err)); 
                    
                Parking.updateOne({'_id': parkingId, 'floor.floorNumber': req.body.floor}, {
                    $set: {
                        'floor.$.slotAvailable': slotAvailableInFloor
                    }})
                    .exec().then(result => {console.log(result)}).catch(err => res.status(404).json(err));
            })
            .catch(err => res.status(404).json({message: "No parking, floor found"}));
    }

    console.log(greenLight);
    Parking.updateOne({'_id': parkingId, 'slot._id': slotId},
        {$set: {
            'slot.$.slotSensor': slotSensor,
            'slot.$.slotBarrier.green': greenLight,
            'slot.$.slotBarrier.red': redLight,
            'slot.$.slotBarrier.blue': blueLight,
            'slot.$.available': available,
            'slot.$.lastUpdate': new Date()
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
