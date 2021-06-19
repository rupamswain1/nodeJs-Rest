const experss=require('express');
const {body}=require('express-validator');
const router=experss.Router();

const feedController=require('../controller/feeds');

router.get('/posts',feedController.getPosts);
router.post('/posts',
[body('title')
.trim()
.isLength({min:5}),
body('content')
.trim()
.isLength({min:5})
],
feedController.createPosts);

router.get('/post/:postId',feedController.getPost);

router.put('/posts/:postId',
[body('title')
.trim()
.isLength({min:5}),
body('content')
.trim()
.isLength({min:5})
],feedController.updatePost);

router.delete('/posts/:postId',feedController.deletePost);
module.exports = router;