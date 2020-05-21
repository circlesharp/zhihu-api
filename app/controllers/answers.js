const Answer = require('../models/answers')
const Question = require('../models/questions')

class AnswersCls {

  async checkQuestionExist (ctx, next) {
    try {
      await Question.findById(ctx.params.questionId)
    } catch (err) {
      ctx.throw(404, '问题不存在')
    }
    await next()
  }

  async checkAnswerExixt (ctx, next) {
    try {
      const answer = await Answer.findById(ctx.params.id).select('+answerer')
      if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
        ctx.throw(404, '该问题下没有此答案')
      }
      ctx.state.answer = answer
    } catch (err) {
      ctx.throw(404, '答案不存在')
    }
    await next()
  }

  async checkAnswerer (ctx, next) {
    const answer = ctx.state.answer // 这里怎么有 answer 呢, 估计在 findById
    if (answer.answerer.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async find (ctx) {
    let { page = 1, per_page = 10 } =  ctx.query
    page = Math.max(+page, 1) - 1
    per_page = Math.max(+per_page, 1)
    const q = new RegExp(ctx.query.q) || '*'
    const answer = await Answer
      .find({ content: q, questionId: ctx.params.questionId })
      .limit(per_page).skip(page * per_page)
    ctx.body = answer
  }

  async findById (ctx) {
    const fields = ctx.query.fields || ''
    const fieldsString = fields.split(';').filter(f => f).map(f => '+' + f).join(' ')
    const answer = await Answer.findById(ctx.params.id)
      .select(fieldsString).populate('answerer')
    ctx.body = answer
  }

  async create (ctx) {
    ctx.verifyParams({
      content: { type: 'string', require: true }
    })
    const answer = await new Answer({
      ...ctx.request.body,
      answerer: ctx.state.user._id,
      questionId: ctx.params.questionId
    }).save()
    ctx.body = answer
  }

  async update (ctx) {
    ctx.verifyParams({
      content: { type: 'string', require: true }
    })
    await ctx.state.answer.update(ctx.request.body) // 应该是局部修改
    ctx.body = ctx.request.body
  }

  async delete (ctx) {
    await Answer.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new AnswersCls()
