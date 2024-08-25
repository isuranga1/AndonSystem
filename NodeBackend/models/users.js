const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({

    name:{
        type: String,
        required:true,
    },

    deptnumber:{
        type: String,
        required:true,
    }

});


const UserModel = mongoose.model("usercollection",UserSchema)


module.exports= UserModel;