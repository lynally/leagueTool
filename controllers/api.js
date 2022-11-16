'use strict'

var express =require('express');

var apiv2 = express.Router();

var mongoose = require('../db.js');//引入对象
const AccountStuff = mongoose.model('People');//引入模型
const StarStuff = mongoose.model('Star');//引入模型

// 投票
apiv2.post('/vote', async function(req, res) {
  const param = req.body
  const starId = param.starId
  if(!starId){
    res.json({
      code: '202',
      msg: `请选择明星`
    });
    return
  }else{
    const objs= await AccountStuff.find()
    const peopleEntity =objs[Math.floor(Math.random()*objs.length)]._doc
    if(peopleEntity.ticket && peopleEntity.ticket>0){
      const doc = await StarStuff.findOne({_id: starId});
      const history ={pid:peopleEntity._id,name:peopleEntity.name,data:new Date()};
      const historys = Array.isArray(doc.history)?doc.history:[]
      historys.splice(historys.length,0,history)
      const newStar = await StarStuff.findOneAndUpdate(
          {_id: starId},
          {ticket:++doc.ticket,history:historys},
          {new:true}
      )
      if(!newStar){
        res.json({
              code: '203',
              msg: `未找到明星`
            });
      }else {
        const history ={pid:newStar._id,name:newStar.name,data:new Date()};
        const historys = Array.isArray(peopleEntity.history)?peopleEntity.history:[]
        historys.splice(historys.length,0,history)
        const newPeople = await AccountStuff.findOneAndUpdate(
            {name: peopleEntity.name},
            {ticket:--peopleEntity.ticket,history:historys},
            {new:true}
        )
        console.log('投票人people',newPeople)
        res.json({
          code: '200',
          msg: `更新成功 ${JSON.stringify(newStar)}`
        });
      }
    }else{
      res.json({
        code: '201',
        msg: `${peopleEntity.name}没有票数，已投完`
      });
    }
  }



  // if(param.name){
  //   var star = new StarStuff({ name: param.name });
  //   star.save(function (err, people) {
  //     console.log(`添加明星（${param.name}）成功`);
  //     res.send('');
  //     if (err) return console.error(err);
  //   });
  // }else{
  //   console.log(`添加明星失败`);
  //   res.send('');
  // }
});

module.exports = apiv2;
