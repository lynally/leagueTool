'use strict'

var express =require('express');


var apiv1 = express.Router();


var mongoose = require('../db.js');//引入对象
var StarStuff = mongoose.model('Star');//引入模型

// multer包用来进行上传文件的接收处理
const multer = require('multer');
var xlsx = require('node-xlsx');
// random包可以生成随机字符串
const random = require('string-random');



apiv1.get('/', function(req, res) {
  res.send('Hello from starApi root route.');
});
// 获取明星列表
apiv1.get('/getStarList', function(req, res) {
  StarStuff.find(function (err, stars) {
    if (err) return console.error(err);
    res.send(stars);
  })
  // res.send('List of starApi users.');
});
// 添加明星
apiv1.post('/add', function(req, res) {
  const param = req.body
  if(param.name){
    var star = new StarStuff({ name: param.name });
    star.save(function (err, people) {
      console.log(`添加明星（${param.name}）成功`);
      res.send('');
      if (err) return console.error(err);
    });
  }else{
    console.log(`添加明星失败`);
    res.send('');
  }
});

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      // 参数1用来设置错误信息，正常处理传null即可
      // 参数2为存储地址
      callback(null, './uploads');
    },
    filename: (req, file, callback) => {
      // 参数2：是最终设置给文件的文件名称，设置随机文件名称，并设置后缀信息即可
      // random()中的数值表示随机字符串的字符个数
      callback(null, random(18) + file.originalname);
    }
  })
}).array('file', 99999);
// 添加明星-excel
apiv1.post('/addByExcel',async function(req, res) {
  console.log(req.file);
  upload(req, res,async (err) => {
    if (err) {
      res.json({
        code: '500',
        msg: '上传失败'
      });
    } else {
      console.log(req.files);
      const fileUrl = req.files[0].path; // 单个文件 路径地址
      var sheets = xlsx.parse(fileUrl);
      console.log(sheets[0].data); // 第一张表的数据

      const list = sheets[0].data;
      if(list.length>0){
        const stars = sheets[0].data[0]
        const vals =stars.map(name=>{
          return {
            name:name
          }
        })
        const {err,people} =await  StarStuff.insertMany(vals);
        if (err) return console.error(err);
      }

      res.json({
        code: '200',
        msg: '上传成功'
      });
    }
  })
});
// 删除明星
apiv1.get('/del', async function(req, res) {
  if(req.query.id){
    const {err} =await StarStuff.deleteOne({_id:req.query.id})
    if (err) return console.error(err);
    res.send('删除明星api-成功');
  }else{
    res.send('删除明星api,添加明星id');
  }

});
// 查找
apiv1.get('/findById', async function(req, res) {
  if(req.query.id){
    const star =await StarStuff.findById(req.query.id)
    if(star){
      res.send(`找到明星${star.name}`,);
    }else{
      res.send('未找到明星');
    }
  }else{
    res.send('未找到明星');
  }
});

module.exports = apiv1;
