const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generateAccessAndRefreshToken } = require("../utils/authUtils");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.registerUser = async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    if ([username, email, fullName, password].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are required");
    }

    const existUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existUser) throw new ApiError(400, "User already exists");

    const avatarLocalFile = req.files?.avatar?.[0]?.path;
    const coverImageLocalFile = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalFile) throw new ApiError(400, "Avatar file is required");

    const coverImage = await uploadOnCloudinary(avatarLocalFile);
    const coverImageUpload = coverImageLocalFile
      ? await uploadOnCloudinary(coverImageLocalFile)
      : null;

    if (!coverImage) throw new ApiError(400, "Failed to upload avatar");

    const user = await User.create({
      fullName,
      avatar: coverImage.url,
      coverImage: coverImageUpload?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser)
      throw new ApiError(500, "Error occurred while registering the user");

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) throw new ApiError(404, "User not found");

    if (!user.isPasswordCorrect(password))
      throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};

exports.logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, null, "User logged out successfully"));
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};

exports.changeCurrentPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password changed successfully"));
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully"));
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};

exports.updateAccountDetials = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) throw new ApiError(400, "All fields are required");

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email: email,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User updated successfully"));
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};

exports.updateUserAvatar = async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) throw new ApiError(400, "Failed to upload avatar");

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar updated successfully"));
  } catch (error) {}
};

exports.updateUserCoverImage = async (req, res) => {
  try {
    const coverLocalPath = req.file?.path;

    if (!coverLocalPath) throw new ApiError(400, "Cover Image is required");

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!coverImage.url) throw new ApiError(400, "Failed to upload CoverImage");

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "CoverImage updated successfully"));
  } catch (error) {}
};

exports.getChannelProfileProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username?.trim()) {
      throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribes",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          // Use $ifNull to ensure these fields are always arrays
          subscribes: { $ifNull: ["$subscribes", []] },
          subscribedTo: { $ifNull: ["$subscribedTo", []] },
          subscribersCount: { $size: "$subscribes" },
          channelSubscribedToCount: { $size: "$subscribedTo" },
          isSubscribed: {
            $cond: {
              if: {
                $in: [req.user?._id, "$subscribedTo.subscriber"], // Check if current user is in the subscribedTo array
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    ]);

    console.log(channel);

    if (!channel?.length) {
      throw new ApiError(404, "Channel not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, channel[0], "User channel found successfully"));
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};

exports.getWatchHistory = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
        },
      },
      {
        $unwind: {
          path: "$watchHistory",
          preserveNullAndEmptyArrays: true, // This allows empty or null watchHistory
        },
      },
      {
        $lookup: {
          from: "users",
          let: { ownerId: "$watchHistory.owner" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$ownerId"],
                },
              },
            },
            {
              $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
          as: "watchHistory.owner",
        },
      },
      {
        $addFields: {
          "watchHistory.owner": { $arrayElemAt: ["$watchHistory.owner", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          watchHistory: { $push: "$watchHistory" },
        },
      },
    ]);

    if (!user || user.length === 0 || !user[0].watchHistory || user[0].watchHistory.length === 0) {
      throw new ApiError(404, "Watch history not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user[0].watchHistory, "Watch history retrieved successfully"));
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};


exports.refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(
        401,
        "Unauthorized request: No refresh token provided"
      );
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded?._id);

    if (!user) {
      throw new ApiError(404, "Invalid refresh token: User not found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or already used");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || 500,
          error.message || "An error occurred"
        )
      );
  }
};
