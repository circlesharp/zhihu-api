const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser') // 用于解析请求体

const app = new Koa()
const router = new Router()

// 内存数据库
const db = [ { name: "李大雷" }, { name: "韩梅" } ]


// 通过 set 设置响应头
router.get('/', ctx => {
  ctx.set('Allow', 'GET, POST, PUT')
  ctx.body = ctx.query
})

// 获取全部用户
router.get('/users', ctx => {
  ctx.body = db
})

// 新增用户
router.post('/users', ctx => {
  db.push(ctx.request.body)
  ctx.body = ctx.request.body
})

// 查询用户
router.get('/users/:id', ctx => {
  ctx.body = db[+ctx.params.id]
})

// 局部修改用户
router.put('/users/:id', ctx => {
  db[+ctx.params.id] = ctx.request.body
  ctx.body = ctx.request.body
})

// 删除用户
router.delete('/users/:id', ctx => {
  db.splice(+ctx.params.id, 1)
  ctx.status = 204
})

app.use(bodyparser()) // badyparser 是一个中间件
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
