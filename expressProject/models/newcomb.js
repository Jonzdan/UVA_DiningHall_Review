const mongoose = require('mongoose')
const newcombSchema = new mongoose.Schema({ //maybe combine this into one collection?
    
    stationName: {
        type: String,
        required: true
    },
    item: {
        itemName: {
            type: String,
            required: true
        },
        itemDesc: {
            type: String,
            required: true
        },
        itemReview: { //this should be embedded document ** change later ** --we can link different documents together
            stars: {
                type: Array,
                required: false
            },
            reviews: {
                type: Array,
                required: false
            }
        },
        timeFrame: {
            type: String,
            required: true
        }
    },
    activeDate: { 
        type: Array,
        required: true
    }
})

newcombSchema.methods.returnReviewStars = function returnReviewStars() {
    const stars =  this.item.itemReview.stars ? this.item.itemReview.stars : -1
    return stars
}

newcombSchema.methods.returnAllReviews = function returnAllReviews() {
    return this.item.itemReview.reviews
}

newcombSchema.methods.returnItem = function returnItem() {
    return (this.stationName, this.item)
}


module.exports = mongoose.model('Newcomb', newcombSchema)