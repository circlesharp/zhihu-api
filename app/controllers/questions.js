const Question = require('../models/questions')

class QuestionsCtl {

  async checkQuestionExist (ctx, next) {
    try {
      const question = await Question.findById(ctx.params.id).select('+questioner')
      ctx.state.question = question
    } catch (err) {
      ctx.throw(404, '问题不存在')
    }
    await next()
  }

  async checkQuestioner (ctx, next) {
    let currentUser = ctx.state.user._id
    let questioner = ctx.state.question.questioner.toString()
    if (currentUser !== questioner) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async find (ctx) {
    let { page = 1, per_page = 10 } =  ctx.query
    page = Math.max(page * 1, 1) - 1
    per_page = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)
    ctx.body = await Question
      .find({ $or: [ {title: q}, {description: q} ] })
      .limit(per_page).skip(page * per_page)
  }

  async findById (ctx) {
    const fields = ctx.query.fields || ''
    const selectFields = fields.split(';')
      .filter(f => f).map(f => '+' + f).join(' ')
    const populateString = fields.split(';')
      .filter(f => f === 'questioner' || 'topics').join(' ')
    const question = await Question.findById(ctx.params.id)
      .select(selectFields).populate(populateString)
    ctx.body = question
  }

  async create (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false }
    })
    const question = await new Question({
      ...ctx.request.body,
      questioner: ctx.state.user._id
    }).save()
    ctx.body = question
  }

  async update (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
      topics: { type: 'string', required: false}
    })
    // 在确定问题是否存在的时候已经查过 id 了
    await ctx.state.question.updateOne(ctx.request.body)
    ctx.body = ctx.state.question
  }

  async delete (ctx) {
    await Question.findByIdAndDelete(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new QuestionsCtl()
