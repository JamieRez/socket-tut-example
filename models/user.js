const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username : String,
  friends : [String],
  isOnline : {type : Boolean, default : false},
  incomingMsgs : [String]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
