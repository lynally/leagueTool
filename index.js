const express = require('express')
const bp = require('body-parser')
var logger = require('morgan')
const app = express()

app.use(logger('dev'))

app.use(bp.urlencoded({ extended: false }))


// 解决跨域问题
app.all('*', function(req, res, next) {
  // 设置允许跨域的域名,*代表允许任意域名跨域
  res.header('Access-Control-Allow-Origin', '*')
  // 允许的header类型
  res.header('Access-Control-Allow-Headers', 'content-type')
  // 跨域允许的请求方式
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')
  if (req.method.toLowerCase() === 'options') {res.send(200)} // 让options 尝试请求快速结束
  else {next()}
})


app.use('/league', require('./controllers/api_league'))

app.get('/', function(req, res, next) {
  res.send('Hello from root route. 111')
})


/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000)
  console.log('Express started on port 3000')
}
