const mongoose = require('mongoose');
const moment = require('moment');
const User = require('../models/user');

exports.list =(req, res) => {
    User.find((err, user) => {
        if(err) {
            res.status(400).send({ error: err });
        }else{
            res.json({ users: user })
        }
    })
}

exports.listOne = (req,res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            res.status(400).send({ error: err });
        }else{
            res.json({ user: user });
        }
    })
}

exports.addUserLocal = (req,res) => {
    const user = new User ({
        _id: new mongoose.Types.ObjectId(),
        local: {
            email: req.body.local.email,
            username: req.body.local.username,
            password: req.body.local.password
        },
        personalInfo: {
            name: req.body.personalInfo.name,
            address: {
                detail: req.body.personalInfo.address.detail,
                province: req.body.personalInfo.address.province,
                district: req.body.personalInfo.address.district,
                subDistrict: req.body.personalInfo.address.subDistrict
            },
            phone: req.body.personalInfo.phone,
            photo: req.body.personalInfo.photo
        },
        balance: 0,
        signUpDate: new Date()
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

exports.signInLocal = (req,res) => {
    const email = req.params.email;
    const password = req.params.password;
    
    User.findOne({'local.email': email, 'local.password': password
        }, (err, user) => {
            if(err){
                res.status(400).send({ error: err });
            }else{
                res.status(200).json({user});
            }
        })
    
}