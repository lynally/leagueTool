const express = require('express')
const bp = require('body-parser');
var logger = require('morgan');
const app  = express();

app.use(logger('dev'))

app.use(bp.urlencoded({ extended: false }));

app.use('/league', require('./controllers/api_league'));

app.get('/', function(req, res,next) {
    res.send('Hello from root route. 111')
});


/* istanbul ignore next */
if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}
