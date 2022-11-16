'use strict'

var express =require('express');

var apiv2 = express.Router();

var mongoose = require('../db.js');//引入对象
const LeagueStuff = mongoose.model('League');//引入模型
// 联赛CURD
apiv2.get('/league/get', function(req, res) {
  LeagueStuff.find(function (err, stars) {
    if (err) return console.error(err);
    res.send(stars);
  })
  // res.send('List of starApi users.');
});
apiv2.post('/league/add', function(req, res) {
  const param = req.body
  if(param.name){
    var star = new LeagueStuff({ name: param.name });
    star.save(function (err, people) {
      console.log(`添加联赛（${param.name}）成功`);
      res.send('');
      if (err) return console.error(err);
    });
  }else{
    console.log(`添加联赛失败`);
    res.send('');
  }
});
module.exports = apiv2;
