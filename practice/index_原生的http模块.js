// 1. 引入 http 模块
const http = require('http')

// 2. 创建 web 服务器对象
let server = http.createServer()

// 3. 监听请求，响应内容
server.on('request', (req, res) => {
  // 3.1 设置响应头
  res.setHeader('content-type', 'text/html;charset=utf-8')

  if (req.url === '/') {
    res.end('主页')
  } else if (req.url === '/login') {
    res.end('登陆页')
  } else {
    res.end('404')
  }
})

// 4. 启动服务
server.listen(3001, () => {
  console.log('服务器启动成功！')
})
