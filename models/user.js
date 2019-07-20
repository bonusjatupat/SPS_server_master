const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

var User = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    personalInfo: {
        name: String,
        phone: String
    },
    balance: Number,
    history: Array,
    role: { type: String, default: 'USER' }
})

module.exports = mongoose.model('SPS_users', User);