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


module.exports = router;