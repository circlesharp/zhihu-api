const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/questions/:questionId/answers' })
const { secret } = require('../config')
const {
  checkAnswerExixt, checkAnswerer, checkQuestionExist,
  find, findById, create, update, delete: del
} = require('../controllers/answers')

const auth = jwt({ secret })

router.get('/', checkQuestionExist, find)
router.post('/', auth, checkQuestionExist, create)
router.get('/:id', checkQuestionExist, checkAnswerExixt, findById)
router.patch('/:id', auth, checkQuestionExist, checkAnswerExixt, checkAnswerer, update)
router.delete('/:id', auth, checkQuestionExist, checkAnswerExixt, checkAnswerer, del)

module.exports = router
