const conn = require('../utils/dbUtils.js')
const sql = require('./sql.js')
const userDao= {
  getUserInfo (id) {
    return new Promise((resolve, reject) => {
      conn.query(sql.serachUserInfoSql, id, (err, results) => {
        if (err || !results) {
          reject('error')
        } else if (results.length !== 1) {
          reject('noData')
        } else {
          resolve(results[0])
        }
      })
    })
  },
  tokenExpired (id, cb) {
    this.getUserInfo(id).then((res) => {
      if (res.tokenExpired > new Date().getTime()) {
        cb && cb(false,false, res)
      } else {
        cb && cb(false,true, res)
      }
    })
    .catch((err) => {
      cb && cb(true, false, {})
    })
  }
}
module.exports = userDao