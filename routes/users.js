const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');


const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required:true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  profileimage: {
    type: String,
  },
  contact: {
    type: Number,
    required: true,
  },
  boards: {
    type: Array,
    default: [],
  },

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:"post"
}]

});

userSchema.plugin(plm)
module.exports=mongoose.model('user',userSchema)