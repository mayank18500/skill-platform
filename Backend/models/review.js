import mongoose from "mongoose";
const Schema = mongoose.Schema;

const reviewSchema= new Schema({
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
    swapRequestId:{
        type: Schema.Types.ObjectId,
        ref: "swapReq",
        required: true,
    },
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    comment: String,
    createdAt: {
        type:Date,
        default: Date.now()
    },
})

module.exports= mongoose.model("Review",reviewSchema);