var mongoose = require('mongoose');

module.exports = mongoose.model('Trip', {
    distance: Number,
    duration: Number,
    start_lat: Number,
    start_lng: Number,
    end_lat: Number,
    end_lng: Number,
    start_address: String,
    end_address: String,
    device_id: String,
    static_url: String
});