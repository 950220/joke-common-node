var express = require('express');
var router = express.Router();
const conn = require('../utils/dbUtils.js');
const sql = require('../dbBase/sql.js');

/* GET home page. */
router.get('/getJokeData', function(req, res, next) {
  conn.query(sql.getJokeSql, (err, results) => {
    if (err) {
      return res.json({
        resultCode: 5000,
        errorDescription: '获取数据失败'
      })
    }
    if (results.length === 0) {
      return res.json({
        resultCode: 5000,
        errorDescription: '暂无数据，敬请期待'
      })
    }
    return res.json({
      resultCode: 200,
      data: results
    })
  })
});

module.exports = router;