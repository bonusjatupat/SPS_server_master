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

exports.signUpCheckEmailExists = (req,res) => {
    const email = req.body.email;

    User.findOne({'local.email': email},
        (err, user) => {
            if(err){
                res.status(400).send({ error: err});
            }

            if(user){
                res.json({ found: true });
            } else {
                res.json({ found: false });
            }
        })
}

exports.signUp = (req, res) => {
            var newUser = new User();

            newUser.local.email = req.body.email;
            newUser.local.password = req.body.password;
            newUser.personalInfo.name = req.body.name;

            newUser._id = new mongoose.Types.ObjectId();
            newUser.local.username = "-";
            newUser.personalInfo.address.detail = "-";
            newUser.personalInfo.phone = "-";
            newUser.personalInfo.photo = "IMG_9924.jpg";
            newUser.balance = 1000;


            newUser.loginLog.push({ method: "local", timestamp: Date.now() });
            newUser.save((err, user) => {
                if (err)
                    res.status(403).send({
                        error: { type: "sys", message: err }
                    });
                else{
                    res.status(200).json({user});
                }
            });
    }

exports.updateBalance = (req,res) => {
    const userId = req.params.userId;
    const amount = req.params.amount;

    var currentBalance = 0;
    var newBalance = 0;

    User.findOne({'_id': userId
        }, (err, user) => {
            if(err){
                res.status(400).send({ error: err });
            }else{
                currentBalance = user.balance;
                newBalance = currentBalance - amount;

                User.update({'_id': userId},
                    {$set: {
                        'balance': newBalance
                    }})
                    .exec()
                    .then(result => {
                        console.log(result);
                        res.status(200).json(result.balance);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    }); 
            }
        }) 
}