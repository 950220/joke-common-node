var express = require('express');
var router = express.Router();
const conn = require('../utils/dbUtils.js')
const getTokenValue = require('../utils/index.js').getTokenValue
const sql = require('../dbBase/sql.js')
const userDao = require('../dbBase/userDao')
var svgCaptcha = require('svg-captcha');

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

/*
 * 注册
 *
 */
router.post('/register', function(req, res, next) {
  let query = req.body
  let cookie = req.cookies['captcha']
  if (!query.username) {
    return res.json({
      resultCode: 5000,
      errorDescription: '用户名不能为空'
    })
  }
  if (!query.password) {
    return res.json({
      resultCode: 5000,
      errorDescription: '密码不能为空'
    })
  }
  if (!query.captcha) {
    return res.json({
      resultCode: 5000,
      errorDescription: '验证码不能为空'
    })
  }
  if (query.captcha !== cookie) {
    return res.json({
      resultCode: 5000,
      errorDescription: '验证码错误'
    })
  }
  conn.query(sql.loginSql, query.username, (err, results) => {
    if (err) {
      return res.json({
        resultCode: 5000,
        errorDescription: '注册失败'
      })
    }
    if (results.length === 0) {
      conn.query(sql.registerSql, [query.username, query.password], (err, results) => {
        if (err) {
          return res.json({
            resultCode: 5000,
            errorDescription: '注册失败'
          })
        }
        if (results&&results.insertId) {
          return res.json({
            resultCode: 200,
            errorDescription: '注册成功'
          })
        }
      })
    } else {
      return res.json({
        resultCode: 5000,
        errorDescription: '用户名已存在'
      })
    }
  })
});

/*
 * 注册验证码
 *
 */
router.get('/captcha', function(req, res, next) {
  var captcha = svgCaptcha.create({ 
    // 翻转颜色 
    inverse: false, 
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    // 字体大小 
    fontSize: 36, 
    // 噪声线条数 
    noise: 2, 
    // 宽度 
    width: 80, 
    // 高度 
    height: 30, 
  }); 
  // 保存到session,忽略大小写 
  req.session = captcha.text.toLowerCase(); 
  console.log(req.session); //0xtg 生成的验证码
  //保存到cookie 方便前端调用验证
  res.cookie('captcha', req.session); 
  res.setHeader('Content-Type', 'image/svg+xml');
  res.write(String(captcha.data));
  res.end();
});

/*
 * 忘记密码
 *
 */
router.post('/forgetPassword', function(req, res, next) {

});

/*
 * 修改密码
 *
 */
router.post('/changePassword', function(req, res, next) {
  let query = req.body
  if (!query.oldPassword) {
    return res.json({
      resultCode: 5000,
      errorDescription: '旧密码不能为空'
    })
  }
  if (!query.newPassword) {
    return res.json({
      resultCode: 5000,
      errorDescription: '新密码不能为空',
    })
  }
  if (!query.confirmPassword) {
    return res.json({
      resultCode: 5000,
      errorDescription: '确认密码不能为空'
    })
  }
  if (query.newPassword !== query.confirmPassword) {
    return res.json({
      resultCode: 5000,
      errorDescription: '新密码和确认密码不一致'
    })
  }
  conn.query(sql.changePasswordSql, [query.newPassword, query.userId], (err, results) => {
    console.log(err)
    if (err) {
      return res.json({
        resultCode: 5000,
        errorDescription: '密码修改失败'
      })
    }
    return res.json({
      resultCode: 200,
      errorDescription: '密码修改成功'
    })
  })
})

module.exports = router;
