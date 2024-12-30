const Tweet = require("../models/tweetModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse")
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel")

const createTweet = asyncHandler(async (req, res) => {
     const {content} = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    res.status(201).json(
        new ApiResponse({
            success: true,
            data: tweet,
            message: "Tweet created successfully",
        })
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse({
            success: true,
            data: tweets,
            message: "Tweets retrieved successfully",
        })
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    if (!content) {
        throw new ApiError(400, "Content is required to update a tweet");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the authenticated user owns the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    res.status(200).json(
        new ApiResponse({
            success: true,
            data: tweet,
            message: "Tweet updated successfully",
        })
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the authenticated user owns the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.deleteOne();

    res.status(200).json(
        new ApiResponse({
            success: true,
            message: "Tweet deleted successfully",
        })
    );
})

module.exports = {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}