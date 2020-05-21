const jwt = require('koa-jwt')
const Router = require('koa-router')
const { secret } = require('../config')
const {
  checkTopicExist, find, findById,
  create, update, listFollowers, listQuestions
} = require('../controllers/topics')

const router = new Router({ prefix: '/topics' })
const auth = jwt({ secret })

// 获取话题列表
router.get('/', find)

// 获取一个话题
router.get('/:id', checkTopicExist, findById)

// 新建话题
router.post('/', auth, create)

// 修改话题
router.patch('/:id', auth, checkTopicExist, update)

// 获取话题的粉丝
router.get('/:id/followers', checkTopicExist, listFollowers)

// 获取话题下的提问
router.get('/:id/questions', checkTopicExist, listQuestions)

module.exports = router
