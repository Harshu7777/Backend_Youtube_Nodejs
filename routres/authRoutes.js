const express = require("express");
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetials, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getChannelProfileProfile, getWatchHistory } = require("../controllers/authController");
const upload = require("../middlewares/multerMiddleware");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// User Registration and Login
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.post("/login" , loginUser)

// secured routes
router.post("/logout" , verifyToken , logoutUser)
router.post("/refresh-token" , refreshAccessToken);
router.post("/change-password" , verifyToken , changeCurrentPassword);
router.get("/current-user" , verifyToken , getCurrentUser);
router.patch("/update-user" , verifyToken , updateAccountDetials);

router.patch("/update-avatar" , verifyToken , upload.single("avatar"), updateUserAvatar);
router.patch("/update-coverImage" , verifyToken , upload.single("coverImage"), updateUserCoverImage);

router.get("/c/:username" , verifyToken , getChannelProfileProfile);

router.get("/watch-history" , verifyToken , getWatchHistory);

module.exports = router;
