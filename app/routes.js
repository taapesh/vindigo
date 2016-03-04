var Device = require('./models/Device');
var path = require('path');

module.exports = function(app) {

    // Get all devices
    app.get('/api/devices', function(req, res) {
        Device.find(function(err, devices) {
            if (err) {
                res.send(err);
            }
            res.json(devices);
        });
    });

    // Get device
    app.get('/api/devices/:device_id', function(req, res) {
        // Avoid object id cast error
        if (!req.params.device_id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(404).json({message: 'Device not found'});
            return;
        }

        Device.findOne({_id: req.params.device_id}, function(err, device) {
            if (err) {
                res.send(err);
                return;
            }

            if (!device) {
                res.status(404).json({message: 'Device not found'});
                return;
            }
            res.json(device);
        });
    });

    // Create a new device
    app.post('/api/devices', function(req, res) {
        var name = req.body.name;
        if (!name) {
            name = 'New Device' // default device name
        }

        Device.create({
            name: name,
            distance: 0,
            duration: 0,
            lat: 32.7819473,
            lng: -96.7907082,
            address: '2203 Commerce St. Dallas, TX',
            vehicle_id: null
        }, function(err, device) {
            if (err) {
                res.send(err);
            }
            res.status(201).json(device);
        });
    });

    // Delete a device
    app.delete('/api/devices/:device_id', function(req, res) {
        Device.remove({
            _id: req.params.device_id
        }, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({'message': 'Deleted device'});
        });
    });

    // Reset a device
    app.post('/api/devices/:device_id/reset', function(req, res) {
        Device.findOneAndUpdate(
            { _id: req.params.device_id },
            { $set: {
                duration: 0,
                distance: 0,
                address: '2203 Commerce St. Dallas, TX',
                lat: 32.7819473,
                lng: -96.7907082
            }},
            { new: true },
            function(err, device) {
                if (err) {
                    res.send(err);
                }
                res.json(device);
            });
    });


    // Save a trip under a device
    app.post('/api/devices/:device_id/log_trip', function(req, res) {
        Device.findOneAndUpdate({ _id: req.params.device_id },
            {
                $set: {lat: req.body.endLat, lng: req.body.endLng},
                $inc: {distance: req.body.distance, duration: req.body.duration}
            },
            function(err, device) {
                if (err) {
                    res.send(err);
                }
                res.json(device);
            });
    });

    // Get all of a device's trips
    app.get('/api/devices/:device_id/trips', function(req, res) {

    });

    // Get details of a trip
    app.get('/api/trips/:trip_id', function(req, res) {

    });
};
