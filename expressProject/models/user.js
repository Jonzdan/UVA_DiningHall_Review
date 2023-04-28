const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required:true
    },
    username: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    //potentially add logs
    profile: {
        picture: { //just send this on long in
            type:String, //base 64 string for img
            required:false,
        },
        subMessage: {
            type:String,
            required: false,
        },
        bannerColor: {
            type:String,
            required: true,
        },
        remainAnonymous: {
            type:Boolean,
            required: true
        }
    },
    notifications: {
        ohill_opt_in: {
            type:Boolean,
            required:true
        },
        runk_opt_in: {
            type:Boolean,
            required:true,
        },
        newcomb_opt_in: {
            type:Boolean,
            required:true,
        },
        opt_in_whenToNotify: {
            type:Array,
            required:true
        },
        food_opt_in_bol: {
            type:Boolean,
            required:true
        },
        food_opt_in_val: { //specific types of food?
            type:Array,
            required:true
        },
        reply_to_post: {
            type:Boolean,
            required:true
        },

    },
    dateJoined: {
        type: Date,
        required: true
    }

})

module.exports = mongoose.model('User',userSchema)