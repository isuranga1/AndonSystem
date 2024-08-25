const mongoose = require('mongoose')


const ConsoleSchema = new mongoose.Schema({

    machine:{
        type: String,
        required:true,
    },

    consoleid: {

        type: Number,
        required: true,

    },


});


const ConsoleIdModel = mongoose.model("machinecollection",ConsoleSchema)


module.exports= ConsoleIdModel;