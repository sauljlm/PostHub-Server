'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema_user = mongoose.Schema({
    userName: { type: String, required: true },
    name: { type: String, required: true },
    bio: { type: String, required: true},
    email: { type: String, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true },
    birthDate: { type: Date, required: true },

    imageURL: { type: String, required: false},
    imagePublic_id: { type: String, required: false},
    userType: { type: String, required: true},

    resetPasswordToken: { type: String, required: false},
    resetPasswordExpires: { type: Date, required: false},
});

schema_user.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hash(password, salt);
  return hash;
};

schema_user.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', schema_user, 'users');