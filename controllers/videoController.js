const Video = require("../models/videoModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");
const { getVideoDurationInSeconds } = require("get-video-duration");

exports.getAllVideos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      query = "",
      sortType = "desc",
      userId,
    } = req.query;

    const skip = (page - 1) * limit;

    const filters = {};
    if (query) filters.title = { $regex: query, $options: "i" };
    if (userId) filters.owner = userId;

    const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 };

    const videos = await Video.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Video.countDocuments(filters);

    return res.status(200).json(
      new ApiResponse({
        success: true,
        data: videos,
        meta: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: parseInt(page),
        },
      })
    );
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    next(new ApiError(500, "Failed to fetch videos"));
  }
};

exports.publishAVideo = async (req, res, next) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const { title, description } = req.body;
    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnail = req.files?.thumbnail?.[0]?.path;

    if (!title || !description || !videoFile || !thumbnail) {
      throw new ApiError(
        400,
        "Title, description, video file, and thumbnail are required."
      );
    }

    // Upload video file to Cloudinary
    const videoUpload = await uploadOnCloudinary(videoFile);
    if (!videoUpload?.secure_url) {
      throw new ApiError(500, "Failed to upload video to Cloudinary.");
    }

    // Upload thumbnail to Cloudinary
    const thumbnailUpload = await uploadOnCloudinary(thumbnail);
    if (!thumbnailUpload?.secure_url) {
      throw new ApiError(500, "Failed to upload thumbnail to Cloudinary.");
    }

    // Calculate video duration using get-video-duration
    const duration = await getVideoDurationInSeconds(videoFile);
    console.log("Video duration:", duration);

    // Create video in database
    const video = await Video.create({
      videoFile: videoUpload.secure_url,
      thumbnail: thumbnailUpload.secure_url,
      title,
      description,
      duration: Math.round(duration),
      owner: req.user._id,
    });

    res.status(201).json(
      new ApiResponse({
        success: true,
        data: video,
        message: "Video published successfully.",
      })
    );
  } catch (error) {
    console.error("Error in publishAVideo:", error);
    next(error); // Pass the error to the error handler
  }
};

exports.incrementVideoViews = async (videoId) => {
  try {
    // Ensure Video ID is valid
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new Error("Invalid Video ID format");
    }

    // Increment the views in the database
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } }, // Increment views
      { new: true } // Return the updated document
    );

    // Return updated video
    return updatedVideo;
  } catch (error) {
    console.error("Error incrementing video views:", error);
    throw error; // Pass the error up to be handled
  }
};

exports.incrementViews = async (req, res, next) => {
  try {
    const { id: videoId } = req.params;

    const updatedVideo = await exports.incrementVideoViews(videoId);

    if (!updatedVideo) {
      throw new ApiError(404, "Video not found");
    }

    res.status(200).json(
      new ApiResponse({
        success: true,
        data: updatedVideo,
        message: "Video views updated successfully",
      })
    );
  } catch (error) {
    console.error("Error in incrementViews:", error);
    next(error);
  }
};

exports.getVideoById = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Validate Video ID
    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid Video ID format");
    }

    // Aggregate Query to Retrieve Video with Owner Details
    const video = await Video.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $project: {
          title: 1,
          description: 1,
          videoFile: 1,
          thumbnail: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          "owner._id": 1,
          "owner.name": 1,
          "owner.email": 1,
        },
      },
    ]);

    if (!video || video.length === 0) {
      throw new ApiError(404, "Video not found");
    }

    // Increment video views
    await exports.incrementVideoViews(videoId);

    res.status(200).json(
      new ApiResponse({
        data: video[0],
        message: "Video retrieved successfully",
      })
    );
  } catch (error) {
    console.error("Error in getVideoById:", error);
    next(error);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      throw new ApiError(400, "Title and Description are required");
    }

    let updatedData = { title, description };

    // Validate Video ID
    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }

    // Check if Video ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid Video ID format");
    }

    // Validate that the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Update fields if provided
    if (title) updatedData.title = title;
    if (description) updatedData.description = description;

    // Check if thumbnail is uploaded
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path, "thumbnails");
      updatedData.thumbnail = result.secure_url;
    }

    // Update the video in the database
    const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validation
    });

    res.status(200).json(
      new ApiResponse({
        success: true,
        data: updatedVideo,
        message: "Video updated successfully",
      })
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    console.log(videoId);

    // Validate Video ID
    if (!videoId) {
      throw new ApiError(400, "Invalid Video ID");
    }

    // Attempt to delete the video
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      throw new ApiError(404, "Video not found");
    }

    // Send success response
    res.status(200).json(
      new ApiResponse({
        success: true,
        message: "Video deleted successfully",
      })
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.togglePublishStatus = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Validate Video ID
    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }

    // Check if Video ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid Video ID format");
    }

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Toggle publish status
    video.isPublished = !video.isPublished;

    // Save the updated video
    await video.save();

    // Send success response
    res.status(200).json(
      new ApiResponse({
        success: true,
        data: {
          videoId: video._id,
          isPublished: video.isPublished,
        },
        message: `Video is now ${
          video.isPublished ? "published" : "unpublished"
        }`,
      })
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};
