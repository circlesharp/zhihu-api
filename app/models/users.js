const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true},
  password: { type: String, required: true, select: false },
  avatar_url: { type: String },
  gender: { type: String, enum: [ 'male', 'female' ], required: true, default: 'male' },
  headline: { type: String }, // 一句话介绍
  locations: { type: [ { type: Schema.Types.ObjectId, ref: 'Topic' } ], select: false }, // 字符串数组
  business: { type: Schema.Types.ObjectId, ref: 'Topic', select: false }, // 行业
  employments: { // 职业经历
    type: [{
      company: { type: Schema.Types.ObjectId, ref: 'Topic' },
      job: { type: Schema.Types.ObjectId, ref: 'Topic' }
    }],
    select: false
  },
  educations: {
    type: [{
      school: { type: Schema.Types.ObjectId, ref: 'Topic' },
      major: { type: Schema.Types.ObjectId, ref: 'Topic' },
      diploma: { type: Number, enum: [ 1, 2, 3, 4, 5 ] },
      entrance_year: { type: Number },
      graduation_year: { type: Number }
    }],
    select: false
  },
  following: {
    type: [ { type: Schema.Types.ObjectId, ref: 'User' } ], // 自己引用自己
    select: false
  },
  followingTopics: {
    type: [ { type: Schema.Types.ObjectId, ref: 'Topic' } ],
    select: false
  },
  likingAnswers: {
    type: [ { type: Schema.Types.ObjectId, ref: 'Answer' } ],
    select: false
  },
  dislikingAnswers: {
    type: [ { type: Schema.Types.ObjectId, ref: 'Answer' } ],
    select: false
  },
  collectingAnswers: {
    type: [ { type: Schema.Types.ObjectId, ref: 'Answer' } ],
    select: false
  }
})

module.exports = model('User', userSchema)
