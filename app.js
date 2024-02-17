const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session);
require('dotenv').config()

const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')
connection.query("SET time_zone='Asia/Seoul';");

app.set('view engine','ejs')
app.set('views','./views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))
app.use(session({ secret: 'john1703', cookie: { maxAge: 60000 }, resave:false, saveUninitialized:false,}))
app.use((req, res, next) => {
  res.locals.member_id=""
  res.locals.name=""
  if(req.session.enroll){
  res.locals.member_id = req.session.enroll.member_id
  res.locals.name = req.session.enroll.name
}
  next()
})

app.get('/', (req, res) => {
  console.log(req.session.enroll);
  res.render('index')
})
app.post('/loginproc', async (req, res) => {
  const member_id = req.body.member_id;
  const pw = req.body.pw;
  var sql = `select * from enroll where member_id=? and pw=?`
  var values = [member_id, pw];
  connection.query(sql, values, function(err, result){
    if(err) throw err;
    if(result.length==0){
      res.send("<script> alert('아이디와 비번을 확인해 주세요!'); location.href='/';</script>");
    }else{
      console.log(result[0]);
      req.session.enroll = result[0];
      
        res.send("<script> alert('로그인 되었습니다.!'); location.href='/';</script>");
     
      
    }
  })  
})
app.get('/medit', (req, res) => {
  res.render('medit')
})
app.post('/meditProc', (req, res) => {
  const member_id = req.session.enroll.member_id;
  const name = req.session.enroll.name;
  const bible_v = req.body.bible_v;
  const title = req.body.title;
  const memo = req.body.memo;
  const regdate = req.body.regdate;
  var sql = `insert into medit(member_id,name,bible_v,title,memo,regdate) values(?,?,?,?,?,now())`
  var values = [member_id,name,bible_v,title,memo];
  connection.query(sql, values, function (err, result){
       if(err) throw err;
       console.log('삽입하였습니다!');
       res.send("<script> alert('저장되었습니다!'); location.href='/medit';</script>")
  })
})
app.get('/meditlist', (req, res) => {
  const member_id = req.session.enroll.member_id;
  const position = req.session.enroll.position;
if(position=="administrator"){
  var sql = `select idx,name,bible_v,title,memo from medit order by regdate desc `
  connection.query(sql, function (err, results, fields) {
      if (err) throw err
      res.render('meditlist', { lists: results })

})
}else{
  var sql = `select idx,bible_v,title,memo from medit where member_id='${member_id}' order by regdate desc `
  connection.query(sql, function (err, results, fields) {
      if (err) throw err
      res.render('meditlist', { lists: results })
})
}
})  
app.get('/meditdelete', (req, res) => {
  var idx = req.query.idx
  var sql = `delete from medit where idx='${idx}'`
  connection.query(sql, function (err, result) {
     if(err) throw err;
     res.send("<script> alert('삭제되었습니다!'); location.href = '/meditlist' </script>")
  })
})

app.post('/meditupdate', (req, res) => {
  const position = req.body.position;
  const idx = req.body.idx;
  const title = req.body.title_;
  const bible_v = req.body.bible_v_;
  const memo = req.body.memo_;
  var sql = `update medit set title=?, bible_v=?, memo=?  where idx=? `
  var values =[title,bible_v,memo]
  connection.query(sql, function (err, result) {
     if(err) throw err;
     res.send("<script> alert('수정되었습니다!'); location.href = '/meditlist' </script>")
  })
})
app.get('/goalcard', (req, res) => {
  res.render('goalcard')
})
app.get('/interce', (req, res) => {
  res.render('interce')
})
app.get('/balance', (req, res) => {
  res.render('balance')
})
app.get('/schedule', (req, res) => {
  res.render('schedule')
})
app.get('/charge', (req, res) => {
  res.render('charge')
})
app.get('/transcript', (req, res) => {
  res.render('transcript')
})
app.get('/attend', (req, res) => {
  res.render('attend')
})
app.get('/counsel', (req, res) => {
  res.render('counsel')
})
app.get('/enroll', (req, res) => {
  res.render('enroll')
})
app.post('/enrollProc', (req, res) => {
  const name = req.body.name;
  const resident_no = req.body.resident_no + req.body.resident_no1;
  const member_id = req.body.resident_no + req.body.resident_no1;
  const address = req.body.address;
  const email = req.body.email;
  const pr_phone = req.body.pr_phone;
  const church = req.body.church;
  const ch_phone = req.body.ch_phone;
  const memo = req.body.memo;
  const agree = req.body.agree;
  const pw = req.body.resident_no1;
  var sql = `insert into enroll(name,resident_no,member_id,address,email,pr_phone,church,ch_phone,memo,agree,pw) 
             values('${name}','${resident_no}','${member_id}','${address}','${email}','${pr_phone}','${church}','${ch_phone}','${memo}','${agree}','${pw}')`
  connection.query(sql, function (err, result){
       if(err) throw err;
         console.log('삽입하였습니다!');
         res.send("<script> alert('저장되었습니다!'); location.href='/';</script>")
  })
})
app.get('/enrolllist', (req, res) => {
  var sql = `select * from enroll order by idx desc`
  connection.query(sql, function (err, results, fields){
    if(err) throw err;
    if(req.session.enroll.position=="administrator"){
      res.render('enrolllist',{lists:results})
    }else{
      res.send("<script> alert('권한이 없습니다!'); location.href='/';</script>");
    }  
    }
  )})
  app.get('/enrolldelete', (req, res) => {
    var idx = req.query.idx
    var sql = `delete from enroll where idx='${idx}'`
    connection.query(sql, function (err, result) {
       if(err) throw err;
       res.send("<script> alert('삭제되었습니다!'); location.href = '/enrolllist' </script>")
    })
  })
app.get('/logout', (req, res) => {
  req.session.enroll = null;
  res.send("<script> alert('로그아웃'); location.href='/';</script>")
})
app.listen(port, () => {
  console.log(`서버가 실행되었습니다. 접속주소: http://127.0.0.1:${port}`)
})

