const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

var User = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    local: {
		email: String,
		username: String,
		password: String
	},
	facebook: {
		id: String,
		token: String,
		username: String,
		email: String,
		photo: String
	},
	google: {
		id: String,
		token: String,
		username: String,
		email: String,
		photo: String
	},
    personalInfo: {
        name: String,
        address: {
            detail: String,
            province: String,
			district: String,
			subDistrict: String
        },
        phone: String,
        photo: String
    },
    balance: Number,
    history: Array,
    role: { type: String, default: 'USER' },
    loginLog: [{
		method: String,
		timestamp: Date
    }],
    signUpDate: Date
})

module.exports = mongoose.model('SPS_users', User);