'use strict'
const moment = require('moment')
var express = require('express')

var apiv2 = express.Router()

var mongoose = require('../db.js')// 引入对象
const LeagueStuff = mongoose.model('League')// 引入模型

// const nodeExcel = require('excel-export');
const xlsx = require('node-xlsx')

// 联赛CURD
apiv2.get('/get', function(req, res) {
  LeagueStuff.find(function (err, stars) {
    if (err) {return console.error(err)}
    res.send(stars)
  })
  // res.send('List of starApi users.');
})
apiv2.post('/add', function(req, res) {
  const param = req.body
  if (param.name) {
    var star = new LeagueStuff({ name: param.name })
    star.save(function (err, people) {
      console.log(`添加联赛（${param.name}）成功`)
      res.send('')
      if (err) {return console.error(err)}
    })
  } else {
    console.log('添加联赛失败')
    res.send('')
  }
})
apiv2.get('/del', async function (req, res) {
  if (req.query.id) {
    const {err} = await LeagueStuff.deleteOne({_id: req.query.id})
    if (err) {
      res.send('')
      return console.error(err)
    }
    console.log(`删除联赛（${req.query.id}）成功`)
    res.send('')
  } else {
    res.send('删除明星api,添加明星id')
  }
})
apiv2.post('/update', async function(req, res) {
  const param = req.body
  if (param.id) {
    const league = await LeagueStuff.findOneAndUpdate(
      {_id: param.id},
      {name: param.name},
      {new: true}
    )
    if (!league) {
      res.json({
        code: '203',
        msg: '未找到联赛'
      })
    } else {
      res.send({
        code: '200',
        msg: '更新成功'
      })
    }
  } else {
    res.send({
      code: '201',
      msg: '缺少id'
    })
  }
})

// 球队CURD
apiv2.post('/addTeam', async function(req, res) {
  const param = req.body
  const leagueId = param.id
  if (!leagueId) {
    res.json({
      code: '201',
      msg: '未找到联赛'
    })
    return
  }
  const teamName = param.teamName
  if (!teamName) {
    res.json({
      code: '202',
      msg: '球队名称为空'
    })
    return
  }
  const league = await LeagueStuff.findOne({_id: leagueId})
  const teams = Array.isArray(league.teams) ? league.teams : []
  teams.push(teamName)
  const newLeague = await LeagueStuff.findOneAndUpdate(
    {_id: param.id},
    {teams: teams},
    {new: true}
  )
  if (!newLeague) {
    res.json({
      code: '203',
      msg: '未找到联赛'
    })
  } else {
    res.send({
      code: '200',
      msg: `更新成功,${newLeague}`
    })
  }
})
apiv2.post('/delTeam', async function(req, res) {
  const param = req.body
  const leagueId = param.id
  if (!leagueId) {
    res.json({
      code: '201',
      msg: '未找到联赛'
    })
    return
  }
  const teamName = param.teamName
  if (!teamName) {
    res.json({
      code: '202',
      msg: '球队名称为空'
    })
    return
  }
  const league = await LeagueStuff.findOne({_id: leagueId})
  const teams = Array.isArray(league.teams) ? league.teams : []
  const index = teams.indexOf(teamName)
  if (index === -1) {
    res.json({
      code: '202',
      msg: '没有这个队伍'
    })
    return
  }
  teams.splice(index, 1)
  const newLeague = await LeagueStuff.findOneAndUpdate(
    {_id: param.id},
    {teams: teams},
    {new: true}
  )
  if (!newLeague) {
    res.json({
      code: '203',
      msg: '未找到联赛'
    })
  } else {
    res.send({
      code: '200',
      msg: `更新成功,${newLeague}`
    })
  }
})
apiv2.post('/updateTeam', async function(req, res) {
  const param = req.body
  const leagueId = param.id
  if (!leagueId) {
    res.json({
      code: '201',
      msg: '未找到联赛'
    })
    return
  }
  const teamName = param.teamName
  if (!teamName) {
    res.json({
      code: '202',
      msg: '球队名称为空'
    })
    return
  }
  const league = await LeagueStuff.findOne({_id: leagueId})
  const teams = Array.isArray(league.teams) ? league.teams : []
  const index = teams.indexOf(teamName)
  if (index === -1) {
    res.json({
      code: '202',
      msg: '没有这个队伍'
    })
    return
  }
  teams.splice(index, 1)
  teams.push(param.newName)
  const newLeague = await LeagueStuff.findOneAndUpdate(
    {_id: param.id},
    {teams: teams},
    {new: true}
  )
  if (!newLeague) {
    res.json({
      code: '203',
      msg: '未找到联赛'
    })
  } else {
    res.send({
      code: '200',
      msg: `更新成功,${newLeague}`
    })
  }
})
apiv2.get('/getTeam', async function(req, res) {
  const leagueId = req.query.id
  if (!leagueId) {
    res.json({
      code: '201',
      msg: '未找到联赛'
    })
    return
  }
  const league = await LeagueStuff.findOne({_id: leagueId})
  res.send({
    code: '200',
    msg: `队伍列表:${league.teams}`
  })
})

// 设置时间  开始日期、每周几开始、每天几场和时间点
apiv2.post('/setTime', async function(req, res) {
  const param = req.body
  const leagueId = param.id
  if (!leagueId) {
    res.json({
      code: '201',
      msg: '未找到联赛'
    })
    return
  }
  const startDate = param.startDate
  const week = param.week
  const dailyTime = param.dailyTime
  console.log('startData', new Date(startDate))
  console.log('week', JSON.parse(week))
  console.log('dailyTime', JSON.parse(dailyTime))
  const newLeague = await LeagueStuff.findOneAndUpdate(
    {_id: param.id},
    {startDate, week, dailyTime},
    {new: true}
  )
  if (!newLeague) {
    res.json({
      code: '203',
      msg: '未找到联赛'
    })
  } else {
    res.send({
      code: '200',
      msg: `更新成功,${newLeague}`
    })
  }
})

// 生成联赛对阵表
apiv2.get('/getVsTable', async function(req, res) {
  const leagueId = req.query.id
  const league = await LeagueStuff.findOne({_id: leagueId})
  if (!league) {
    res.send({
      code: '201',
      msg: `未找到指定联赛:${leagueId}`
    })
    return
  }
  if (!league.teams || league.teams.length === 0) {
    res.send({
      code: '202',
      msg: `给联赛联赛:${league.name}添加队伍`
    })
    return
  }
  if (!league.dailyTime || !league.startDate || !league.week) {
    res.send({
      code: '203',
      msg: `给联赛联赛:${league.name}设置时间`
    })
    return
  }

  const teams = league.teams
  const vsArr = []
  teams.forEach((item1, index1) => {
    teams.forEach((item2, index2) => {
      if (index1 < index2) {
        vsArr.push(item1 + '-' + item2)
      }
    })
  })
  vsArr.sort(() => Math.random() - 0.5)
  console.log('总比赛', vsArr, vsArr.length)
  // 日期、星期、时间
  const startDate = new Date(league.startDate)
  const week = JSON.parse(league.week)
  const dailyTime = JSON.parse(league.dailyTime)

  const days_vs = {} // 赛程日期
  // eslint-disable-next-line new-cap
  let curDate = new moment(startDate)
  while (vsArr.length > 0) {
    console.log('当前日期', curDate)
    const weekday = curDate.weekday()
    if (week.includes(weekday)) {
      const date = curDate.format('M:DD')
      console.log('今天有比赛', date)
      const obj = {}
      dailyTime.forEach(timeRange => {
        const vs = vsArr.shift()
        if (!vs) {
          return false
        }
        obj[timeRange] = vs
      })
      days_vs[date] = obj
    }
    curDate.add(1, 'days')
  }
  console.log('赛程日期', days_vs)

  let colsArr = ['序号', '日期']
  dailyTime.forEach(timeRange => {
    colsArr.push(timeRange)
  })
  let array = []
  array.push(colsArr)
  let index = 1
  // eslint-disable-next-line guard-for-in
  for (var key in days_vs) {
    const val = days_vs[key]
    const row = [`第${index}轮`, key]
    // eslint-disable-next-line guard-for-in
    for (var time in val) {
      row.push(val[time])
    }
    index++
    array.push(row)
  }
  array.concat(array)
  res.send(xlsx.build([{
    name: 'sheet1',
    data: array
  }]))


})


module.exports = apiv2
