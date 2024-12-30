const mongoose = require("mongoose");
const Like = require("../models/likemodel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("express-async-handler");

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  // Check if a like already exists for this video by this user
  const existingLike = await Like.findOne({ video: videoId, likeBy: userId });

  if (existingLike) {
    // If a like exists, remove it (unlike)
    await existingLike.deleteOne();
    res.status(200).json(
      new ApiResponse({
        success: true,
        message: "Video like removed.",
      })
    );
  } else {
    // Otherwise, add a new like
    const newLike = await Like.create({ video: videoId, likeBy: userId });
    res.status(201).json(
      new ApiResponse({
        success: true,
        data: newLike,
        message: "Video liked successfully.",
      })
    );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  // Check if a like already exists for this comment by this user
  const existingLike = await Like.findOne({
    comment: commentId,
    likeBy: userId,
  });

  if (existingLike) {
    // If a like exists, remove it (unlike)
    await existingLike.deleteOne();
    res.status(200).json(
      new ApiResponse({
        success: true,
        message: "Comment like removed.",
      })
    );
  } else {
    // Otherwise, add a new like
    const newLike = await Like.create({ comment: commentId, likeBy: userId });
    res.status(201).json(
      new ApiResponse({
        success: true,
        data: newLike,
        message: "Comment liked successfully.",
      })
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  // Check if a like already exists for this tweet by this user
  const existingLike = await Like.findOne({ tweet: tweetId, likeBy: userId });

  if (existingLike) {
    // If a like exists, remove it (unlike)
    await existingLike.deleteOne();
    res.status(200).json(
      new ApiResponse({
        success: true,
        message: "Tweet like removed.",
      })
    );
  } else {
    // Otherwise, add a new like
    const newLike = await Like.create({ tweet: tweetId, likeBy: userId });
    res.status(201).json(
      new ApiResponse({
        success: true,
        data: newLike,
        message: "Tweet liked successfully.",
      })
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all liked videos by the user
  const likedVideos = await Like.find({
    likeBy: userId,
    video: { $exists: true },
  }).populate("video");

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: likedVideos,
      message: "Liked videos fetched successfully.",
    })
  );
});

module.exports = {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
};
