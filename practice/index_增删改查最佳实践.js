const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

router.get('/', ctx => {
  ctx.body = 'this is home page'
})

// 增
router.post('/users', ctx => {
  ctx.body = { name: '李雷' }
})

// 删 返回 204
router.delete('/users/:id', ctx => {
  ctx.status = 204
})

// 改
router.put('/users/:id', ctx => {
  ctx.body = { name: '修改美团' }
})

// 查 全部
router.get('/users', ctx => {
  ctx.body = [ { name: '李雷' }, { name: '韩梅梅' } ]
})

// 查 某一项
router.get('/users/:id', ctx => {
  ctx.body = { name: '李雷withId' }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
