const express = require('express');
const { 
    getSubscribedChannels, 
    toggleSubscription, 
    getUserChannelSubscribers 
} = require('../controllers/subscriptionController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/c/:channelId" ,verifyToken , getSubscribedChannels)
router.post("/c/:channelId" ,verifyToken , toggleSubscription)

router.get("/u/:channelId" ,verifyToken , getUserChannelSubscribers)

module.exports = router;