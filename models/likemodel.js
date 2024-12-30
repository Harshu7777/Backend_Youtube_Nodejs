const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
    video: {
      type: mongoose.Types.ObjectId,
      ref: 'Video',
    },
    likeBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
    tweet: {
      type: mongoose.Types.ObjectId,
      ref: 'Tweet',
    },
  },
  {
    timestamps: true,
  }
);


const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
