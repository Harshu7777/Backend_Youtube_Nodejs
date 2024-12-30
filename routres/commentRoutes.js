const express = require('express');
const { getVideoComments, addComment, updateComment, deleteComment } = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/:videoId" ,verifyToken , getVideoComments);
router.post("/:videoId" ,verifyToken , addComment);

router.patch("/c/:commentId" , verifyToken , updateComment)
router.delete("/c/:commentId" , verifyToken , deleteComment)

module.exports = router;