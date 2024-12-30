const Comment = require("../models/commentModel")
const Video = require("../models/videoModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("express-async-handler");

// Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Fetch comments with pagination
    const comments = await Comment.find({ video: videoId })
        .populate("owner", "fullname email") // Populating owner's details
        .sort({ createdAt: -1 }) // Sorting by most recent
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.status(200).json(
        new ApiResponse({
            success: true,
            data: comments,
            message: "Comments fetched successfully",
        })
    );
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Extract videoId from the URL
    const { context } = req.body;  // Extract comment context from the request body
    const owner = req.user._id;    // Extract the authenticated user ID

    if (!context) {
        throw new ApiError(400, "Comment content is required.");
    }

    const newComment = await Comment.create({
        context,
        video: videoId,
        owner,
    });

    res.status(201).json(
        new ApiResponse({
            success: true,
            data: newComment,
            message: "Comment added successfully.",
        })
    );
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { context } = req.body;
    const owner = req.user._id;

    if (!context) {
        throw new ApiError(400, "Context is required");
    }

    // Find and update the comment
    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner },
        { context },
        { new: true }
    );

    if (!comment) {
        throw new ApiError(404, "Comment not found or not authorized to update");
    }

    res.status(200).json(
        new ApiResponse({
            success: true,
            data: comment,
            message: "Comment updated successfully",
        })
    );
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const owner = req.user._id;

    // Find and delete the comment
    const comment = await Comment.findOneAndDelete({ _id: commentId, owner });

    if (!comment) {
        throw new ApiError(404, "Comment not found or not authorized to delete");
    }

    res.status(200).json(
        new ApiResponse({
            success: true,
            message: "Comment deleted successfully",
        })
    );
});

module.exports = {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
};
