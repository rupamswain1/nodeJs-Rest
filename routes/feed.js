const experss=require('express');

const router=experss.Router();

const feedController=require('../controller/feeds');

router.get('/posts',feedController.getPosts);
router.post('/posts',feedController.createPosts);

module.exports = router;