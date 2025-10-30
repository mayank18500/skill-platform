import mongoose from "mongoose";
const Schema = mongoose.Schema;

const adminSchema= new Schema({
    title: String,
    content: String,
    category:{
        type: String,
        enum: ["info", "warning", "maintenance"],
    },
    isActive: Boolean,
    createdAt: {
        type:Date,
        default: Date.now()
    },
});

export default mongoose.model("AdminMessage", adminSchema);