const Topic = require('../models/topics')
const User = require('../models/users')
const Question = require('../models/questions')

class TopicsCtl {

  // 话题是否存在 中间件
  async checkTopicExist (ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) { ctx.throw(404, '话题不存在') }
    await next()
  }

  // 获取话题列表 分页 默认 ?page=1&per_page=10
  async find (ctx) {
    let { page = 1, per_page = 10 } =  ctx.query
    page = Math.max(page * 1, 1) - 1
    per_page = Math.max(per_page * 1, 1)
    ctx.body = await Topic
      .find({ name: new RegExp(ctx.query.q) }) // 模糊搜索，google 用 q 代表关键词
      .limit(per_page).skip(per_page * page)
  }

  // 获取一个话题
  async findById (ctx) {
    const fields = ctx.query.fields || '' // 代码更加健壮
    const selectFields = fields.split(';').filter(f => f).map(f => '+' + f).join(' ')
    ctx.body = await Topic.findById(ctx.params.id).select(selectFields)
  }

  // 新建话题
  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    const name = ctx.request.body.name
    const repeatedTopicname = await Topic.findOne({ name }) // 填入一个 object
    if (repeatedTopicname) {
      ctx.throw(409, '该话题已经存在') // 409 Conflict 冲突
    }
    ctx.body = await new Topic(ctx.request.body).save()
  }

  // 修改话题
  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    ctx.body = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
  }

  // 获取话题粉丝
  async listFollowers (ctx) {
    const users = await User.find({ followingTopics: ctx.params.id })
    ctx.body = users
  }

  // 获取话题下的问题
  async listQuestions (ctx) {
    const questions = await Question.find({ topics: ctx.params.id })
    ctx.body = questions
  }
}

module.exports = new TopicsCtl()
