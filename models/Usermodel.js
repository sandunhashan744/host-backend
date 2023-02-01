import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
    // username : {
    //     type : String,
    //     required : [true, "Please Provide a unique Name"],
    //     unique : [true, "User Name Exist"]
    // },

    firstName : {
        type : String,
        required : [true, "Please Provide the First Name"]
    },
    lastName : {
        type : String,
        required : [true, "Please Provide the Last Name"],
    },
    telegram : {
        type : Number,
        required : [true, "Please Provide the Telegrame No"],       
    },
    metaTrade : {
        type : String,
        required : [true, "Please Provide the Meta Trade No"],
    },
    email : {
        type : String,
        required : [true, "Please Provide the Unique email"],
        unique : true
    },
    password : {
        type: String,
        required : [true, "Please Provide a Password"],
        unique : false
    },
    profile : {type : String},
    userRoles : {
        type : Number,
        default : 1
    }
});

export default mongoose.model.users || mongoose.model('users', UserSchema)
