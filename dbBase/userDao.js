const conn = require('../utils/dbUtils.js')
const sql = require('./sql.js')
const userDao= {
  getUserInfo (id) {
    new Promise((resolve, reject) => {
      conn.query(sql.serachUserIngoSql, id, (err, results) => {
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
    getUserInfo(id).then((res) => {
      cb(false, res)
    })
    .catch((err) => {
      cb(true, {})
    })
  }
}
module.exports = userDao