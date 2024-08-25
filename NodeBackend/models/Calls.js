const mongoose = require('mongoose')


const CallSchema = new mongoose.Schema({

    Color:{
        type: String,
        required:true,
    },

    Description: {

        type: String,
        required: true,

    },
    CallTo: {

        type: String,
        required: true,

    },



});


const CallModel = mongoose.model("callcollection",CallSchema)


module.exports= CallModel;