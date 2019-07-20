const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const router = require('./routes');

const _CONFIG = require("./misc/config");

const app = express();

mongoose.connect('mongodb+srv://secureParkingSystem:' + process.env.MONGO_ATLAS_PW +'@sps-arks6.mongodb.net/SPS?retryWrites=true', {useNewUrlParser: true});
                 // mongodb+srv://secureParkingSystem:<password>@sps-arks6.mongodb.net/test?retryWrites=true
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router.home);
app.use('/user', router.user);
app.use('/parking', router.parking);
app.use('/reservation', router.reservation);
app.use('/reservationProcess', router.reservationProcess);

const PORT = process.env.PORT || 5000;
/*app.set('domain', '172.20.10.4');
app.set('port', process.env.PORT || 8080);
app.listen(PORT, () => { 
    console.log('Server started on port ' + PORT);
});*/

//app.listen(PORT, '172.20.10.4', function(){
 //   console.log('Server started on port ' + PORT);
//});

/*var port = process.env.PORT || 5000;  
app.listen(port, () => {
    console.log('Updated : Server listening at port'+ port);
}); */

app.listen(_CONFIG.SERVER.PORT, () => {
    console.log(`PARKernel Server started on port *:${_CONFIG.SERVER.PORT}`);
});
