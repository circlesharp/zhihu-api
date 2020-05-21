const Koa = require('koa')

const app = new Koa()


// app.use 里面是一个函数（或者叫：中间件）
app.use(async (ctx, next) => { // ctx context 上下文
  console.log(1.1)
  await next()
  console.log(1.2)
  ctx.body = 'hello world'
})

app.use(async (ctx, next) => {
  console.log(2.1)
  await next()
  console.log(2.2)
})

app.use(async () => {
  console.log(3)
})

app.listen(3000)
