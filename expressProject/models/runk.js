const mongoose = require('mongoose')
const runkSchema = new mongoose.Schema({
    
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
            required: false
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

runkSchema.methods.returnReviewStars = function returnReviewStars() {
    const stars =  this.item.itemReview.stars ? this.item.itemReview.stars : -1
    return stars
}

runkSchema.methods.addReview = function addReview(obj) {
    let reviewDesc = obj.itemReview.reviews
    this.item.itemReview.reviews.append(reviewDesc)
}

runkSchema.methods.returnAllReviews = function returnAllReviews() {
    return this.item.itemReview.reviews
}

runkSchema.methods.returnItem = function returnItem() {
    return (this.stationName, this.item)
}


module.exports = mongoose.model('Runk', runkSchema)