const User = require("../models/userModel")
exports.generateAccessAndRefreshToken = async(userId) => {
    try {
      const user  = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken;
  
      await user.save(
        {validateBeforeSave: false}
      );
  
      return {
        accessToken,
        refreshToken
      }
  
    } catch (error) {
      console.error(error);
      throw new ApiError(500, error.message || "Error occurred");
    }
  }