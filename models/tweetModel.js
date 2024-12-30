const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Pre-save middleware: Perform an action before saving a tweet
tweetSchema.pre('save', function (next) {
    console.log(`Tweet by owner ${this.owner} is about to be saved`);
    next();
});

// Post-save middleware: Perform an action after saving a tweet
tweetSchema.post('save', function (doc, next) {
    console.log(`Tweet with content "${doc.content}" has been saved`);
    next();
});

// Pre-find middleware: Log before finding tweets
tweetSchema.pre('find', function (next) {
    console.log('A find operation is about to execute');
    next();
});

// Post-remove middleware: Clean up after removing a tweet
tweetSchema.post('remove', function (doc) {
    console.log(`Tweet with content "${doc.content}" has been removed`);
});

module.exports = mongoose.model("Tweet", tweetSchema);
