const express = require('express')
const bp = require('body-parser');
var logger = require('morgan');
const app  = express();
var schedule = require('node-schedule');

var mongoose = require('./db.js');//引入对象
const AccountStuff = mongoose.model('People');//引入模型


app.use(logger('dev'))


app.use(bp.urlencoded({ extended: false }));

app.use('/v1', require('./controllers/api_star'));
app.use('/v2', require('./controllers/api'));

app.get('/', function(req, res,next) {
    res.send('Hello from root route.')
});




function scheduleCronstyle(){
  schedule.scheduleJob('59 59 23 * * *',async function(){
    console.log('每天定时恢复票数:' + new Date());
    await AccountStuff.updateMany({}, { ticket: 3})
  });
}

scheduleCronstyle();


/* istanbul ignore next */
if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}
