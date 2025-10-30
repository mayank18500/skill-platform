const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema= new Schema({
    name: {
        type:  String,
        required: true,
    },
    email: {
        type:  String,
        required: true,
    },
    location: String,
    profilePhoto: String,
    skillOffered: [{
        type: String
    }],
    skillWanted: [{
        type: String
    }],
    isPublic: Boolean,
    role:{
        type: String,
        enum:["user","admin"]
    },
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    totalSwaps: Number,
    joinDate:{
        type:Date,
        default: Date.now()
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

module.exports= mongoose.model("User", userSchema);