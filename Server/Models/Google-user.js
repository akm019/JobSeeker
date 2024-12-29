import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    // picture:{
    //     type:String,
    //     required:true,
    // },
    role:{
        type:String,
        required:true,
    }


})

export default mongoose.model('GoogleUser',userSchema)