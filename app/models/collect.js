const mongoose = require('mongoose')

const { Schema, model } = mongoose

const a = Schema({
  aa: {type: String}
})

module.exports = model('b', a) // 通过测试，mongoDB 会在这个字符后面加 s，得到 bs 的 collection