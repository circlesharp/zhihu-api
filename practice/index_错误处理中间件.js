const Koa = require('koa')
const bodyparser = require('koa-bodyparser')

const app = new Koa()
const routing = require('./routes')

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) { // 404 错误不能被捕获，客户端处理
    ctx.status = err.status || err.statusCode || 500
    ctx.body = {
      message: err.message
    }
  }
}) // 错误处理中间件要放在最前面
app.use(bodyparser())
routing(app) // 批量注册路由

app.listen(3000, () => {
  console.log('程序启动在 3000 端口')
})
