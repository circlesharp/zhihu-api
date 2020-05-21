const Koa = require('koa')
const path = require('path')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')

const routing = require('./routes')
const { connectionStr, connectionOpt } = require('./config')

// MongoDB
mongoose.connect(
  connectionStr,
  connectionOpt,
  () => { console.log('MongoDB 连接成功...') }
)
// mongoose.set('useFindAndModify', false) // 看文档
mongoose.connection.on('error', console.error)

const app = new Koa()

app.use(koaStatic(path.join(__dirname, 'public'))) // 静态文件都是在最前面的

app.use(error({
  postFormat: (e, { stack, ...rest }) => {
    return process.env.NODE_ENV === 'production' ? rest : { ...rest, stack } // pord 不输出 stack 字段
  }
}))

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true
  }
}))

app.use(parameter(app)) // 校验参数，记得把 app 传进去
routing(app) // 批量注册路由

app.listen(3000, () => {
  console.log('程序启动在 3000 端口')
})
