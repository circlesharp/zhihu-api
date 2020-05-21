module.exports = {
  connectionStr: 'mongodb://112.74.205.47:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false',
  // connectionStr: 'mongodb+srv://circle:codemao666@cluster0-2n1s8.mongodb.net/test?retryWrites=true&w=majority',
  connectionOpt: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
  secret: 'zhihu-jwt-secret',
  expiresIn: '1d'
}