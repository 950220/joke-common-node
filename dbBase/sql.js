const sql = {
  // user
  loginSql: 'select * from user where username = ?',
  registerSql: 'insert into user (username, password) values (?,?)',
  serachUserInfoSql: 'select * from user where id = ?',
  tokenUpdateSql: 'update user set token=?,tokenExpiredDate=? where id = ?',
  getQuestionAnxietySql: 'select * from question_anxiety order by rand() limit 10',
  getQuestionCharmSql: 'select * from question_charm order by rand() limit 10',
  getQuestionPrivitySql: 'select * from question_privity order by rand() limit 10',
  getQuestionSafeSql: 'select * from question_safe order by rand() limit 10',
  getJokeSql: 'select * from joke_list order by rand() limit 10'
}
module.exports = sql