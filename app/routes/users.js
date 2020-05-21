const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/users' })
const { secret } = require('../config')
const { find, findById, create, update, delete: del,
  login, listFollowing, checkUserExist,
  follow, unfollow, followTopic, unfollowTopic,
  listFollowers, listFollowingTopics, listQuestions,
  listLikingAnswers, likeAnswer, unlikeAnswer,
  listDislikingAnswers, dislikeAnswer, undislikeAnswer,
  listCollectingAnswers, collectAnswer, unCollectAnswer
} = require('../controllers/users')
const { checkTopicExist } = require('../controllers/topics')

// 用户认证
const auth = jwt({ secret })

// 用户授权
const checkOwner = async (ctx, next) => {
  if (ctx.params.id !== ctx.state.user._id) {
    ctx.throw(403, '没有权限')
  }
  await next()
}

// 获取全部用户
router.get('/', find)

// 新增用户
router.post('/', create)

// 查询用户
router.get('/:id', findById)

// 局部修改用户 put 要给成 patch
router.patch('/:id', auth, checkOwner, update)

// 删除用户
router.delete('/:id', auth, checkOwner, del) // 关键字会报错，取别名 del

// 用户登陆
router.post('/login', login)

// 关注用户(使用token, 判断用户是否存在)
router.put('/following/:id', auth, checkUserExist, follow)

// 取关用户
router.delete('/following/:id', auth, checkUserExist, unfollow)

// 获取关注列表
router.get('/:id/following', checkUserExist, listFollowing)

// 获取粉丝列表
router.get('/:id/followers', checkUserExist, listFollowers)

// 获取用户提问列表
router.get('/:id/questions', checkUserExist, listQuestions)

// 关注话题
router.put('/followingTopic/:id', auth, checkTopicExist, followTopic)

// 取关话题
router.delete('/followingTopic/:id', auth, checkTopicExist, unfollowTopic)

// 获取关注话题列表
router.get('/:id/followingTopics', checkUserExist, listFollowingTopics)

// 获取赞过的答案列表
router.get('/:id/likingAnswers', listLikingAnswers)

// 赞答案
router.put('/likingAnswer/:id', auth, likeAnswer, undislikeAnswer)

// 取消赞答案
router.delete('/unlikingAnswer/:id', auth, unlikeAnswer)

// 获取踩过的答案列表
router.get('/:id/dislikingAnswers', listDislikingAnswers)

// 踩答案
router.put('/dislikingAnswer/:id', auth, dislikeAnswer, unlikeAnswer)

// 取消踩答案
router.delete('/undislikingAnswer/:id', auth, undislikeAnswer)

// 获取收藏的答案列表
router.get('/:id/collectingAnswers', listCollectingAnswers)

// 收藏答案
router.put('/collectAnswer/:id', auth, collectAnswer)

// 取消收藏答案
router.delete('/unCollectAnswer/:id', auth, unCollectAnswer)

module.exports = router
