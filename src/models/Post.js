'use strict';
const mongoose = require('mongoose');

const schema_task = mongoose.Schema({
    postTitle: { type: String, required: true },
    postDate: { type: Date, required: true },
    imageURL: { type: String, required: false},
    public_id: { type: String, required: false},
    postDescription: { type: String, required: true},
    userName: { type: String, required: true},
    userEmail: { type: String, required: true }
});

module.exports = mongoose.model('Post', schema_task, 'posts');
