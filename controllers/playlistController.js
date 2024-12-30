const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Playlist = require("../models/playlistModel");
const Video = require("../models/videoModel");

// Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user._id;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner,
  });

  res.status(201).json(
    new ApiResponse({
      success: true,
      data: playlist,
      message: "Playlist created successfully",
    })
  );
});

// Get playlists created by a specific user
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const playlists = await Playlist.find({ owner: userId });

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: playlists,
      message: "User playlists retrieved successfully",
    })
  );
});

// Get a playlist by its ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID");
  }

  const playlist = await Playlist.findById(playlistId).populate("video");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: playlist,
      message: "Playlist retrieved successfully",
    })
  );
});

// Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Playlist ID or Video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  playlist.video = videoId;
  await playlist.save();

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: playlist,
      message: "Video added to playlist successfully",
    })
  );
});

// Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Playlist ID or Video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.video.toString() !== videoId) {
    throw new ApiError(400, "Video not found in playlist");
  }

  playlist.video = null;   // Clear the video field
  await playlist.save();

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: playlist,
      message: "Video removed from playlist successfully",
    })
  );
});

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Playlist deleted successfully",
    })
  );
});

// Update a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(400, "At least one of name or description is required");
  }

  const updatedData = {};
  if (name) updatedData.name = name;
  if (description) updatedData.description = description;

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: updatedPlaylist,
      message: "Playlist updated successfully",
    })
  );
});

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
