var express = require('express');
var router = express.Router();
const conn = require('../utils/dbUtils.js');
const sql = require('../dbBase/sql.js');

/* GET home page. */
router.post('/getQuestion', function(req, res, next) {
  let query = req.body
  let sqlStr = ''
  switch (query.type) {
    case 'anxiety':
      sqlStr = sql.getQuestionAnxietySql;
      break;
    case 'charm':
      sqlStr = sql.getQuestionCharmSql;
      break;
    case 'privity':
      sqlStr = sql.getQuestionPrivitySql;
      break;
    case 'safe':
      sqlStr = sql.getQuestionSafeSql;
      break;
    default: 
      return res.json({
        resultCode: 5000,
        errorDescription: 'type不能为空'
      })
  }
  conn.query(sqlStr, (err, results) => {
    if (err) {
      return res.json({
        resultCode: 5000,
        errorDescription: '数据获取失败'
      })
    }
    if (results.length === 0) {
      return res.json({
        resultCode: 5000,
        errorDescription: '不存在此数据'
      })
    }
    return res.json({
      data: results,
      resultCode: 200
    })
  })
})

router.post('/submitTest', function(req, res, next) {
  let query = req.body
  let score = 0
  const testType = query.testType
  const id = query.userId
  const results = query.results
  results.forEach(item => {
    switch(item.selectItem) {
      case 'A':
        score += 10;
        break;
      case 'B':
        score += 9;
        break;
      case 'C':
        score += 8;
        break;
      case 'D':
        score += 7;
        break;
      case 'E':
        score += 6;
        break;
    }
  });
  conn.query(sql.insertResutlSql, [id, score, JSON.stringify(results), testType], (err, results) => {
    console.log(err)
    if (err) {
      return res.json({
        resultCode: 5000,
        errorDescription: '提交测试失败'
      })
    }
    if (!results) {
      return res.json({
        resultCode: 5000,
        errorDescription: '提交测试失败'
      })
    }
    return res.json({
      resultCode: 200,
      data: {
        testId: results.insertId
      }
    })
  })
})

router.post('/getResultById', function(req, res, next) {
  let query = req.body
  conn.query(sql.getResultScoreSql, query.testId, async (err, results) => {
    if (err) {
      return res.json({
        resultCode: 5000,
        errorDescription: '获取失败'
      })
    }
    let score = 0
    let testType = ''
    let tagList = []
    let resultList = []
    results.forEach((item) => {
      score = Math.floor(item.score/10) * 10
      testType = item.testType
    })
    console.log(score, testType)
    await conn.query(sql.getResultLabelSql, [score, testType], (err, results) => {
      console.log(results)
      if (err) {
        return res.json({
          resultCode: 5000,
          errorDescription: '获取失败'
        })
      }
      tagList = results
    })
    await conn.query(sql.getResultIntroSql, [score, testType], (err, results) => {
      console.log(err)
      if (err) {
        return res.json({
          resultCode: 5000,
          errorDescription: '获取失败'
        })
      }
      resultList = results
      return res.json({
        resultCode: 200,
        data: {
          tagList,
          resultList
        }
      })
    })
  })
})


module.exports = router;