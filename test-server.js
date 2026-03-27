// 简单的测试服务器 - 用于验证二级目录部署
const express = require('express')
const path = require('path')

const app = express()
const PORT = 8080

// 静态文件服务 - 二级目录 /admSystem
app.use('/admSystem', express.static(path.join(__dirname, 'frontend/dist')))

// 处理前端路由 - 所有 /admSystem 下的路由都返回 index.html
app.get('/admSystem/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'))
})

// 根路径提示
app.get('/', (req, res) => {
  res.send(`
    <h1>测试服务器运行中</h1>
    <p>前端访问地址: <a href="/admSystem">/admSystem</a></p>
  `)
})

app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`)
  console.log(`前端访问地址: http://localhost:${PORT}/admSystem`)
})
