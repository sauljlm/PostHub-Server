'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema_task = mongoose.Schema({
    userName: { type: String, required: true },
    userBirthDate: { type: Date, required: true },
    userEmail: { type: String, required: true },
    userPassword: { type: String, required: true },
    imageURL: { type: String, required: false},
    public_id: { type: String, required: true},
    userType: { type: Number, required: false},
    bibliography: { type: String, required: true},
});

schema_task.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hash(password, salt);
  return hash;
};

schema_task.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.userPassword);
};

module.exports = mongoose.model('User', schema_task, 'users');