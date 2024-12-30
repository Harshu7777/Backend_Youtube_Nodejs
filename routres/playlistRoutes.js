const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
} = require("../controllers/playlistController");
const router = express.Router();

router.post("/", verifyToken, createPlaylist);

router
  .route("/:playlistId")
  .get(verifyToken ,getPlaylistById)
  .patch(verifyToken ,updatePlaylist)
  .delete(verifyToken ,deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyToken ,addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyToken ,removeVideoFromPlaylist);

router.route("/user/:userId").get(verifyToken , getUserPlaylists);

module.exports = router;
