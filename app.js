const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const router = require('./routes');
const flash = require("connect-flash");
const passport = require("passport");
const session = require("express-session");

const _CONFIG = require("./misc/config");

const app = express();

mongoose.connect('mongodb+srv://secureParkingSystem:' + process.env.MONGO_ATLAS_PW +'@sps-arks6.mongodb.net/SPS?retryWrites=true', {useNewUrlParser: true});
                 // mongodb+srv://secureParkingSystem:<password>@sps-arks6.mongodb.net/test?retryWrites=true
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(
    session({
      secret: "what_does_the_fox_says_?",
      resave: false,
      cookie: { expires: new Date(253402300000000) },
      saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router.home);
app.use('/user', router.user);
app.use('/parking', router.parking);
app.use('/reservation', router.reservation);
app.use('/reservationProcess', router.reservationProcess);
app.use("/parking_pic", express.static(path.join(__dirname, "../parkernel-img-cdn/parking_pic")));

const PORT = process.env.PORT || 5000;

app.listen(_CONFIG.SERVER.PORT, () => {
    console.log(`PARKernel Server started on port *:${_CONFIG.SERVER.PORT}`);
});
