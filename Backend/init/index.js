const mongoose = require("mongoose");
const initData = require("./data.js");
const User = require("../models/user.js");

main()
    .then(()=>{
        console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    })
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/skillswap');
};

const initDB=  async ()=>{
    await User.deleteMany({});
    initData.data= initData.data.map((obj)=>({...obj}))
    await User.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();