const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscribers : {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
} , {
    timestamps: true
})

module.exports = mongoose.model("Subscription" , subscriptionSchema)