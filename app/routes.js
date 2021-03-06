var Device = require('./models/Device');
var Trip = require('./models/Trip');
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

    // Get a device
    app.get('/api/devices/:device_id', function(req, res) {
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

    // Update device stats
    app.post('/api/devices/:device_id/log_trip', function(req, res) {
        Device.findOneAndUpdate({ _id: req.params.device_id },
            {
                $set: {lat: req.body.end_lat, lng: req.body.end_lng},
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
        Trip.find( {device_id: req.params.device_id}, function(err, trips) {
            if (err) {
                res.send(err);
            }
            res.status(200).json(trips);
        });
    });

    // Create a trip
    app.post('/api/trips', function(req, res) {
        Trip.create({
            distance: req.body.distance,
            duration: req.body.duration,
            start_lat: req.body.start_lat,
            start_lng: req.body.start_lng,
            end_lat: req.body.end_lat,
            end_lng: req.body.end_lng,
            start_address: req.body.start_address,
            end_address: req.body.end_address,
            device_id: req.body.device_id,
            static_url: req.body.static_url
        }, function(err, trip) {
            if (err) {
                res.send(err);
            }
            res.status(201).json(trip);
        });
    });

    // Get a trip
    app.get('/api/trips/:trip_id', function(req, res) {
        if (!req.params.trip_id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(404).json({message: 'Trip not found'});
            return;
        }

        Trip.findOne({_id: req.params.trip_id}, function(err, trip) {
            if (err) {
                res.send(err);
                return;
            }

            if (!trip) {
                res.status(404).json({message: 'Trip not found'});
                return;
            }
            res.json(trip);
        });
    });

    // Delete a trip
    app.delete('/api/trips/:trip_id', function(req, res) {
        Trip.remove({
            _id: req.params.trip_id
        }, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({'message': 'Deleted trip'});
        });
    });
};
