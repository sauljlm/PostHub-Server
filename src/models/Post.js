'use strict';
const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    userName: { type: String, required: true},
    commentText: { type: String, required: true },
    commentDate: { type: Date, default: Date.now }
});

const likeSchema = mongoose.Schema({
    userName: { type: String, required: true}
});

const schema_post = mongoose.Schema({
    postTitle: { type: String, required: true },
    postDate: { type: Date, default: Date.now },
    imageURL: { type: String, required: false},
    imagePublic_id_id: { type: String, required: false},
    postDescription: { type: String, required: true},
    userName: { type: String, required: true},
    comments: [commentSchema],
    likes: [likeSchema],
    state: { type: String, default: "AC"}
});

module.exports = mongoose.model('Post', schema_post);
