const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } = require('../controllers/likeController');

const router = express.Router();

router.post("/toggle/v/:videoId" , verifyToken , toggleVideoLike);
router.post("/toggle/c/:commentId" , verifyToken , toggleCommentLike);
router.post("/toggle/t/:tweetId" , verifyToken , toggleTweetLike);
router.get("/videos" , verifyToken , getLikedVideos);

module.exports = router;