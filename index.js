const express = require('express')
const bp = require('body-parser');
var logger = require('morgan');
const app  = express();
// var schedule = require('node-schedule');

var mongoose = require('./db.js');//引入对象
// const AccountStuff = mongoose.model('People');//引入模型

app.use(logger('dev'))

app.use(bp.urlencoded({ extended: false }));

app.use('/v1', require('./controllers/api'));

app.get('/', function(req, res,next) {
    res.send('Hello from root route. ssss12')
});

/* istanbul ignore next */
if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}
