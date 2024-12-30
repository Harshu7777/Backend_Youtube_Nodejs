const express = require('express');
const { createTweet, getUserTweets, updateTweet, deleteTweet } = require('../controllers/tweetController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/" , verifyToken ,createTweet);

router.get("/user/:userId" ,verifyToken , getUserTweets);

router.patch("/:tweetId" , verifyToken , updateTweet);

router.delete("/:tweetId" , verifyToken , deleteTweet);

module.exports = router;