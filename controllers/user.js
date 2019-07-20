const mongoose = require('mongoose');
const moment = require('moment');
const User = require('../models/user');

exports.insert = (req,res) => {
    const user = new User ({
        _id: new mongoose.Types.ObjectId(),
        personalInfo: {
            name: req.body.personalInfo.name,
            phone: req.body.personalInfo.phone
        },
        balance: req.body.balance,
    })

    user.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Handling POST requests to /users",
                createdUser: result
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}