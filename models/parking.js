const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

var Parking = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
	name: String,
	description: String,
	address: {
		description: String,
		location: {
			type: { type: String, enum: 'Point', default: 'Point' },
			coordinates: { type: [Number], default: [0,0] }
		}
	},
	photos: [String],
	contact: [{
		type: String,
		value: String
	}],
    sensorSupported: { type: Boolean, default: true },
	numberBuilding: Number,
	numberFloor: Number,
	floor: [{
		floorNumber: Number,
		facilities: String,
		slotTotal: Number,
		slotAvailable: Number
	}],
	numberSlot: {
		total: Number,
		used: { type: Number, default: 0 },
		disable: Number
	},
	slot: [{
		slotNumber: Number,
		building: Number,
		floor: Number,
        slotSensor: Boolean, //true(1) = parking , false(0) = no car
        slotBarrier: {
            green: Boolean, //true(1) = on , //false(0) = off
            red: Boolean,
			blue: Boolean
        },
        available: String, //format: 'available', 'reserved', 'parking'
        lastUpdate: Date
    }],
	facility: [String], // format: ['covered_parking', 'coffee', 'restaurant', 'wifi', 'car_wash', 'security']
	type: String, // format: 'paid', 'customer', 'private', 'free'
	price: {
		free: {
			hour: Number
		},
		paid: {
			rate: Number,
			per: String // format: 'hour', 'day', 'all', 'half_hour'
		}
	},
	visible: { type: Boolean, default: false },
	spsSupported: Boolean
	/*review: [{
		star: Number,
		message: String,
		user_id: Schema.Types.ObjectId,
		timestamp: Date
	}],
	report: [{
		message: String,
		user_id: Schema.Types.ObjectId,
		timestamp: Date
	}],
	verify_by: Schema.Types.ObjectId,
	visible: { type: Boolean, default: false },
	maximumCarTypeSupport: String,
	meta: {
		created: { date: Date, user_id: Schema.Types.ObjectId },
		modified: [{ date: Date, user_id: Schema.Types.ObjectId }]
	}*/
});

//Parking.index({"address.location": '2dsphere'});

module.exports = mongoose.model('SPS_parkings', Parking);
