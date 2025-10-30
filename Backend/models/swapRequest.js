const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const swapRequestSchema= new Schema({
    fromUserId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toUserId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    skillOffered: [{
        type: String
    }],
    skillWanted: [{
        type: String
    }],
    message: String,
    status:{
        type: String,
        enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    },
    createdAt:{
        type:Date,
        default: Date.now()
    },
    updatedAt: {
        type:Date,
        default: Date.now()
    },
})

module.exports= mongoose.model("swapReq",swapRequestSchema);