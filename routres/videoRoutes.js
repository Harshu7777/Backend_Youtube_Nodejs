const express = require("express");
const {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
} = require("../controllers/videoController");
const upload = require("../middlewares/multerMiddleware");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(verifyToken , getAllVideos)

router.post(
    "/publish",
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    verifyToken,
    publishAVideo
  );

router
  .route("/:videoId")
  .get(verifyToken,getVideoById)
  .delete(verifyToken, deleteVideo)
  .patch(verifyToken, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyToken, togglePublishStatus);

module.exports = router;
