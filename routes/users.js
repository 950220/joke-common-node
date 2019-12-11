var express = require('express');
var router = express.Router();
const conn = require('../utils/dbUtils.js')
const getTokenValue = require('../utils/index.js').getTokenValue
const sql = require('../dbBase/sql.js')
const userDao = require('../dbBase/userDao')

/* 登录接口 */
router.post('/login', function(req, res, next) {
  let query = req.body
  console.log(query)
  conn.query(sql.loginSql, query.username, (err, results) => {
    if (err) {
      return res.json({
        resultCode: 500,
        errorDescription: '获取数据失败'
      })
    }
    if (!results || results.length !== 1) {
      return res.json({
        resultCode: 500,
        errorDescription: '用户名不存在'
      })
    }
    results.forEach(item => {
      if (item.password !== query.password) {
        return res.json({
          resultCode: 500,
          errorDescription: '密码错误'
        })
      } else {
        let token = getTokenValue(item.id, item.username)
        let tokenExpiredDate = new Date().getTime() + 12*60*60*1000
        conn.query(sql.tokenUpdateSql, [token, tokenExpiredDate, +item.id], function(err, results) {

        })
        let data = JSON.parse(JSON.stringify(item))
        data.token = token
        data.tokenExpiredDate = undefined
        return res.json({
          resultCode: 200,
          data: data,
          errorDescription: ''
        })
      }
    })
  })
});

/* 
 * 获取用户信息
 * 模拟客户端token和guid,设置token过期时间为12小时，过期返回401
 */

router.post('/getUserInfo', function(req, res, next) {
  const query = req.body
  userDao.tokenExpired(query.userId, (err, expired, data) => {
    if (err) {
      return res.json({
        resultCode: 5000,
        errorDescription: '获取用户信息失败'
      })
    }
    if (expired) {
      return res.json({
        resultCode: 401,
        errorDescription: '登录已过期'
      })
    }
    return res.json({
      data: data,
      resultCode: 200
    })
  })
});

module.exports = router;
