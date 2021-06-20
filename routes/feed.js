const experss=require('express');
const {body}=require('express-validator');
const router=experss.Router();

const feedController=require('../controller/feeds');
const isAuth=require('../middleware/is-auth');

router.get('/posts',isAuth,feedController.getPosts);
router.post('/posts',isAuth,
[body('title')
.trim()
.isLength({min:5}),
body('content')
.trim()
.isLength({min:5})
],
feedController.createPosts);

router.get('/post/:postId',isAuth,feedController.getPost);

router.put('/posts/:postId',isAuth,
[body('title')
.trim()
.isLength({min:5}),
body('content')
.trim()
.isLength({min:5})
],feedController.updatePost);

router.delete('/posts/:postId',isAuth,feedController.deletePost);
module.exports = router;