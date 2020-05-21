const Koa = require('koa')

const app = new Koa()

// 路由的本质是中间件
// 路由决定了不同url是如何被不同地执行的

// 为什么要用路由
// 没有路由回怎么样呢？ 所有的请求都做了相同的事，返回相同的结果
// 1. 处理不同的 URL
// 2. 处理不同的 HTTP 方法
// 3. 解析 URL 上的参数

// 自己编写 路由中间件， 实现常用的功能
app.use(async (ctx) => {
  if (ctx.url === '/') {
    ctx.body = 'home page'
  } else if (ctx.url === '/users') {
    if (ctx.method === 'GET') {
      ctx.body = 'users pages'
    } else if (ctx.method === 'POST') {
      ctx.body = 'new user register'
    } else {
    ctx.status = 405 // 不允许 405 Method Not Allowed
    }
  } else if (ctx.url.match(/\/users\/(\w+)/)) {
    const userId = ctx.url.match(/\/users\/(\w+)/)[1]
    ctx.body = `this is user: ${userId}.`
  } else {
    ctx.status = 404
  }
})

app.listen(3000)
