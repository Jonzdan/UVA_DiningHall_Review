//session id, csrf, auth (maybe?), 
const mongoose = require('mongoose')
const identifierSchema = new mongoose.Schema({
    session_token: {
        type: String,
        required: false
    },
    csrf_token: {
        type: String,
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
})

module.exports = mongoose.model('Token', identifierSchema)