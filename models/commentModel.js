const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    context: {
      type: String,
      required: true,
      trim: true, 
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Example: Pre-save validation for content length
commentSchema.pre('save', function (next) {
  if (this.context.length > 500) {
    return next(new Error('Comment exceeds the maximum length of 500 characters.'));
  }
  next();
});

// Example: Pre-remove cleanup
commentSchema.pre('remove', async function (next) {
  console.log(`Comment with ID: ${this._id} is being removed.`);
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
