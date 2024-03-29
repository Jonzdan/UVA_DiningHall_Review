const mongoose = require('mongoose')
const ohillSchema = new mongoose.Schema({
    
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
        itemReview: { //did i figure out how to match stars and reviews?
            stars: {
                type: Array,
                required: true
            },
            starsLength: {
                type: Number,
                required: true
            },
            reviews: { //prob add date and shit done...
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

ohillSchema.methods.returnReviewStars = function returnReviewStars() {
    const stars =  this.item.itemReview.stars ? this.item.itemReview.stars : -1
    return stars
}

ohillSchema.methods.returnAllReviews = function returnAllReviews() {
    return this.item.itemReview.reviews
}

ohillSchema.methods.returnItem = function returnItem() {
    return (this.stationName, this.item)
}


module.exports = mongoose.model('Ohill', ohillSchema)