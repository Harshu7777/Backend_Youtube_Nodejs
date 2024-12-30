const mongoose = require('mongoose');
const User = require("../models/userModel.js")
const Subscription = require("../models/subscriptionModel")
const ApiError = require("../utils/ApiError.js")
const ApiResponse = require("../utils/ApiResponse")
const asyncHandler = require("express-async-handler");

// Controller to toggle subscription (subscribe/unsubscribe)
const toggleSubscription = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id; 

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Check if the subscription already exists
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscribers: subscriberId,
  });

  if (existingSubscription) {
    // Unsubscribe (delete subscription)
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res.status(200).json(
      new ApiResponse({
        success: true,
        message: "Unsubscribed successfully",
      })
    );
  }

  // Subscribe (create new subscription)
  const newSubscription = await Subscription.create({
    channel: channelId,
    subscribers: subscriberId,
  });

  res.status(201).json(
    new ApiResponse({
      success: true,
      data: newSubscription,
      message: "Subscribed successfully",
    })
  );
});

// Controller to get subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Find all subscribers of the channel
  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscribers",
    "name email" 
  );

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: subscribers.map((sub) => sub.subscribers), // Return only subscriber details
      message: "Subscribers retrieved successfully",
    })
  );
});

// Controller to get channel list to which a user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res, next) => {
  const subscriberId = req.user._id; // Assuming the logged-in user ID is available in req.user._id

  // Find all channels the user has subscribed to
  const subscriptions = await Subscription.find({ subscribers: subscriberId }).populate(
    "channel",
    "name email" // Assuming User model has these fields
  );

  res.status(200).json(
    new ApiResponse({
      success: true,
      data: subscriptions.map((sub) => sub.channel), // Return only channel details
      message: "Subscribed channels retrieved successfully",
    })
  );
});

module.exports = {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
