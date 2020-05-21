const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret, expiresIn } = require('../config')

class UsersCtl {

  async find (ctx) {
    let { page = 1, per_page = 10 } =  ctx.query
    page = Math.max(+page, 1) - 1
    per_page = Math.max(per_page * 1, 1)
    ctx.body = await User
      .find({ name: new RegExp(ctx.query.q) }) // 模糊搜索
      .limit(per_page).skip(per_page * page)
  }

  async findById (ctx) {
    const fields = ctx.query.fields || '' // 代码更加健壮
    const fieldsString = fields.split(';').filter(f => f).map(f => '+' + f).join(' ')
    const populateString = fields.split(';').filter(f => f).map(f => {
      if (f === 'employments') {
        return 'employments.company employments.job'
      }
      if (f === 'educations') {
        return 'educations.school educations.major'
      }
      return f
    }).join(' ')
    console.log(fieldsString)
    try {
      const user = await User
        .findById(ctx.params.id)
        .select(fieldsString)
        .populate(populateString)
      ctx.body = user
    } catch (err) {
      ctx.throw(404, '用户不存在')
    }
  }
  
  async create (ctx) {
    ctx.verifyParams({ // 422 Unprocessable Entity
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })
    const name = ctx.request.body.name
    const repeatedUsername = await User.findOne({ name }) // 填入一个 object
    if (repeatedUsername) {
      ctx.throw(409, '该用户名已经存在') // 409 Conflict 冲突
    }
    const user = await new User(ctx.request.body).save()
    // ctx.body = user // 这里为啥泄露很多信息
    ctx.body = {
      name: user.name,
      gender: user.gender,
      _id: user._id
    }
  }
  
  // 这个接口很重要，用于更新用户信息
  async update (ctx) {
    ctx.verifyParams({ // 422 Unprocessable Entity
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false }
    })
    try {
      const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
      ctx.body = user
    } catch (err) {
      ctx.throw(404, '用户不存在')
    }
  }

  async delete (ctx) {
    try {
      const user = await User.findByIdAndRemove(ctx.params.id)
      ctx.status = 204
    } catch (err) {
      ctx.throw(404, '用户不存在')
    }
  }

  // 登陆
  async login (ctx) {
    ctx.verifyParams({ // 422 Unprocessable Entity
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })
    // 用户名或密码错误 十分不友好的垃圾做法
    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, '用户名或密码不正确') // 401 Unauthorized
    }
    // 帐号密码匹配
    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn })
    ctx.body = { _id, token } // 把 token 返回给客户端
  }

  // 获取关注列表
  async listFollowing (ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+following')
      .populate('following')
    try {
      ctx.body = user.following
    } catch (err) {
      ctx.throw('404')
    }
  }

  // 获取粉丝列表
  async listFollowers (ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }

  // 获取问题列表
  async listQuestions (ctx) {
    const questions = await Question.find({ questioner: ctx.params.id })
    ctx.body = questions
  }

  // 检查用户是否存在
  async checkUserExist (ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) { ctx.throw(404, '用户不存在') }
    await next()
  }

  // 关注用户
  async follow (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取关用户
  async unfollow (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 关注话题
  async followTopic (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取关话题
  async unfollowTopic (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 获取关注话题列表
  async listFollowingTopics (ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+followingTopics')
      .populate('followingTopics')
    try {
      ctx.body = user.followingTopics
    } catch (err) {
      ctx.throw('404')
    }
  }

  // 获取赞过的答案列表
  async listLikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+likingAnswers').populate('likingAnswers')
    ctx.body = user.likingAnswers
  }

  // 赞答案
  async likeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id)
      .select('+likingAnswers').populate('likingAnswers')
    if (!me.likingAnswers.map(i => i.id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } }) // 投票数+1
    }
    ctx.status = 204
    await next()
  }

  // 取消赞
  async unlikeAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers').populate('likingAnswers')
    const index = me.likingAnswers.map(i => i._id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } }) // 投票数-1
    }
    ctx.status = 204
  }

  // 获取踩过的答案列表
  async listDislikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    ctx.body = user.dislikingAnswers
  }

  // 踩答案
  async dislikeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers').populate('dislikingAnswers')
    if (!me.dislikingAnswers.map(i => i._id.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  // 取消踩
  async undislikeAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers').populate('dislikingAnswers')
    const index = me.dislikingAnswers.map(i => i._id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 获取收藏的答案列表
  async listCollectingAnswers (ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+collectingAnswers').populate('collectingAnswers')
    ctx.body = user.collectingAnswers
  }

  // 收藏答案
  async collectAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id)
      .select('+collectingAnswers').populate('collectingAnswers')
    if (!me.collectingAnswers.map(i => i._id.toString()).includes(ctx.params.id)) {
      me.collectingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消收藏答案
  async unCollectAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id)
      .select('+collectingAnswers').populate('collectingAnswers')
    const index = me.collectingAnswers.map(i => i._id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.collectingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
}

module.exports = new UsersCtl()

// // 用户认证
// const auth = async (ctx, next) => {
//   const { authorization = '' } = ctx.request.header
//   const token = authorization.replace('Bearer ', '')
//   try {
//     const user = jsonwebtoken.verify(token, secret)
//     ctx.state.user = user
//   } catch (err) {
//     ctx.throw(401, err.message)
//   }
//   await next()
// }
