const sql = {
  // user
  loginSql: 'select * from user where username = ?',
  serachUserInfoSql: '',
  tokenUpdateSql: 'update user set token=?,tokenExpiredDate=? where id=?'
}
module.exports = sql