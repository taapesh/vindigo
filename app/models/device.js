var mongoose = require('mongoose');

module.exports = mongoose.model('Device', {
    name: String,
    distance: Number,
    duration: Number,
    lat: Number,
    lng: Number,
    address: String,
    vehicle_id: String
});