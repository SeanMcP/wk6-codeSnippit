const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

mongoose.connect('mongodb://localhost:27017/codeSnippitDB')

const snippitSchema = new Schema({
  author: {type: String, required: false},
  title: {type: String, required: false},
  code: {type: String, required: false},
  note: String,
  language: [String],
  tag: [String],
  public: Boolean
})

const Snippit = mongoose.model('Snippit', snippitSchema)

module.exports = Snippit
