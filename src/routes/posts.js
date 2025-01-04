'use strict';
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const fs = require('fs-extra');
const claudinary = require('cloudinary');

claudinary.config({
    cloud_name: 'dvdgijhpc',
    api_key: '992268627513137',
    api_secret: 'W3NBvBWIP2Qe00JQYltXAzMLoSc'
});

router.get('/', async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

router.get('/posts/get-posts', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const posts = await Post.find();
    console.log(posts);
    res.json(posts);
});

router.post('/posts/new-post', async (req, res) => {
    console.log(req.body);
    const result = await claudinary.v2.uploader.upload(req.file.path);
    const newPost = new Post({
        imageURL: result.url,
        imagePublic_id: result.public_id,
        postTitle : req.body.postTitle,
        postDate : req.body.postDate,
        postDescription : req.body.postDescription,
        userName : req.body.userName
    });
    newPost.save((error) => {
        if (error) {
            res.status(500).send({
                status: 500,
                error: `El post no se pudo registar`
            })
        } else {
            res.json({
                msj: 'El post se registró correctamente'
            });
        }
    });
    await fs.unlink(req.file.path); // delete local file
});

router.post('/posts/new-comment', async (req, res) => {
    console.log(req.body);

    const post = await Post.findById(req.body.userId);
    if (!post) {
        return { error: 'Post no encontrado' };
    }

    const newComment = new Comment({
        userId : req.body.userId,
        commentText : req.body.commentTitle,
        commentDate : req.body.commentDate
    });

    post.comments.push(newComment);
    await post.save((error) => {
        if (error) {
            res.status(500).send({
                status: 500,
                error: `El comentario no se pudo registar`
            })
        } else {
            res.json({
                msj: 'El comentario se agregó correctamente'
            });
        }
    });
});

router.put('/posts/update-post/:id', async (req, res) => {
    let upsatePost = null;
    // const result = await claudinary.v2.uploader.upload(req.file.path);
    console.log(req.body);
    upsatePost = await Post.findByIdAndUpdate(req.params.id, {
        // imageURL: result.url,
        // public_id: result.public_id,
        postTitle : req.body.postTitle,
        postDescription : req.body.postDescription,
    })
    
    upsatePost.save((error) => {
        if (error) {
            res.status(500).send({
                status: 500,
                error: `El post no se pudo modificar`
            });
        } else {
            res.json({
                msj: 'El post se modificó correctamente'
            });
        }
    });
});

router.delete('/posts/delete-post/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    Post.findByIdAndDelete(id, (error) => {
        if (error) {
            res.status(500).send({
                status: 500,
                error: `El post no se pudo eliminar`
            });
        } else {
            res.json({
                msg: `se elimino con exito`
            })
        }
    });
});

module.exports = router;