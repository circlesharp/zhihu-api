const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()
const usersRouter = new Router({ prefix: '/users' }) // 前缀

// 多中间件
const auth = async (ctx, next) => {
  if(ctx.url !== '/users/admin') {
    ctx.throw(401) // 401 Unauthorized
  }
  await next()
}

router.get('/', (ctx) => {
  ctx.body = 'this is home page'
})

usersRouter.get('/', (ctx) => {
  ctx.body = 'this is users page'
})

usersRouter.post('/', (ctx) => {
  ctx.body = 'create a new user'
})

usersRouter.get('/:id', auth, (ctx) => {
  ctx.body = `this is user: ${ctx.params.id}.`
}) // 使用多中间件，可以一直加下去

app.use(router.routes()) // router.toutes() 创建中间件
app.use(usersRouter.routes())
app.use(usersRouter.allowedMethods()) // 1. 响应 options 方法 2. 返回 405 / 501

app.listen(3000)
