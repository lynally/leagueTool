'use strict'
const moment = require('moment')
var express = require('express')

var apiv2 = express.Router()

var mongoose = require('../db.js')// 引入对象
const LeagueStuff = mongoose.model('League')// 引入模型

// const nodeExcel = require('excel-export');
const xlsx = require('node-xlsx')

// 联赛CURD
apiv2.get('/getLeagueList', function(req, res) {
  LeagueStuff.find(function (err, stars) {
    if (err) {return console.error(err)}
    res.send(stars)
  })
  // res.send('List of starApi users.');
})
apiv2.get('/getLeagueInfo', async function(req, res) {
  const param = req.query
  console.log('param', param)
  if (param.id) {
    const league = await LeagueStuff.findOne({_id: param.id})
    if (!league) {
      res.json({
        code: '203',
        msg: '未找到联赛'
      })
    } else {
      res.send({
        code: 200,
        data: league,
        msg: 'sucess'
      })
    }
  } else {
    res.send({
      code: '201',
      msg: '缺少id'
    })
  }
})

// 新增联赛-
apiv2.post('/addLeague', async function(req, res) {
  const param = req.body
  const name = param.name
  const teamName = param.teamName
  const startDateValue = param.startDate
  const startDate = moment(new Date(Number(param.startDate))).format('YYYY-MM-DD HH:mm:ss')
  const week = param.week
  const dailyTime = param.dailyTime

  if (!name) {
    res.send({code: 201, msg: '添加联赛失败，缺少名字'})
    return
  }
  if (!teamName) {
    res.json({code: 202, msg: '球队名称为空'})
    return
  }
  var game = new LeagueStuff({
    name: param.name,
    teams: JSON.parse(teamName).map(obj => obj.value),
    startDate,
    startDateValue,
    week: JSON.parse(week),
    dailyTime: JSON.parse(dailyTime).map(obj => {
      const time = obj.value
      return time.reduce(
        (pre, cur) => {
          const start = moment(new Date(pre)).format('HH:mm')
          const end = moment(new Date(cur)).format('HH:mm')
          return `${start}-${end}`
        }
      )
    }),
    dailyTimeValue: JSON.parse(dailyTime)
  })
  game.save().then(function(product) {
    res.json({code: 200, data: product, msg: `${param.name}创建成功`})
  })
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
apiv2.get('/delLeague', async function (req, res) {
  if (req.query.id) {
    const {err} = await LeagueStuff.deleteOne({_id: req.query.id})
    if (err) {
      return console.error(err)
      res.send({code: 201, msg: '删除失败'})
    }

    res.send({code: 200, msg: '更新成功'})
  } else {
    res.send('删除id')
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
// 更新联赛-
apiv2.post('/updateLeague', async function(req, res) {
  const param = req.body
  if (param.id) {
    const name = param.name
    const teamName = param.teamName
    const startDateValue = param.startDate
    const startDate = moment(new Date(Number(param.startDate))).format('YYYY-MM-DD HH:mm:ss')
    const week = param.week
    const dailyTime = param.dailyTime

    if (!name) {
      res.send({code: 201, msg: '更新联赛失败，缺少名字'})
      return
    }
    if (!teamName) {
      res.json({code: 202, msg: '球队名称为空'})
      return
    }


    const league = await LeagueStuff.findOneAndUpdate(
      {
        _id: param.id
      },
      { name: param.name,
        teams: JSON.parse(teamName).map(obj => obj.value),
        startDate,
        startDateValue,
        week: JSON.parse(week),
        dailyTime: JSON.parse(dailyTime).map(obj => {
          const time = obj.value
          return time.reduce(
            (pre, cur) => {
              const start = moment(new Date(pre)).format('HH:mm')
              const end = moment(new Date(cur)).format('HH:mm')
              return `${start}-${end}`
            }
          )
        }),
        dailyTimeValue: JSON.parse(dailyTime)},
      {new: true}
    )
    if (!league) {
      res.json({
        code: '203',
        msg: '未找到联赛'
      })
    } else {
      res.send({
        code: 200,
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
  const startDate = new Date(Number(league.startDateValue))
  const week = league.week
  const dailyTime = league.dailyTime

  const days_vs = {} // 赛程日期
  // eslint-disable-next-line new-cap
  let curDate = moment(startDate)
  while (vsArr.length > 0) {
    const weekday = curDate.weekday()
    if (week.includes(weekday)) {
      const date = curDate.format('M.DD')
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
  const temp = {
    index: '轮次',
    data: '日期',
    time0: '13:00-14:00',
    time1: '13:00-14:00'
  }
  let colsArr = [{key: 'index', value: '轮次'}, {key: 'data', value: '日期'}]
  dailyTime.forEach((timeRange, index) => {
    colsArr.push({key: `${timeRange}`, value: timeRange})
  })
  let array = []
  let index = 1
  // eslint-disable-next-line guard-for-in
  for (var key in days_vs) {
    const val = days_vs[key]
    const row = {
      index: index,
      data: key
    }
    // eslint-disable-next-line guard-for-in
    for (let time in val) {
      row[time] = val[time]
    }
    index++
    array.push(row)
  }
  array.concat(array)


  // let array = []
  // let index = 1
  // // eslint-disable-next-line guard-for-in
  // for (var key in days_vs) {
  //   const val = days_vs[key]
  //   const row = [`第${index}轮`, key]
  //   // eslint-disable-next-line guard-for-in
  //   for (var time in val) {
  //     row.push(val[time])
  //   }
  //   index++
  //   array.push(row)
  // }
  // array.concat(array)

  // res.send(xlsx.build([{
  //   name: 'sheet1',
  //   data: array
  // }]))
  res.send({
    code: 200,
    data: {
      head: colsArr,
      data: array
    },
    msg: '成功'
  })


})


module.exports = apiv2
