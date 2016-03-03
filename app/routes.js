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

    // Create a new device
    app.post('/api/devices', function(req, res) {
        var name = req.body.name;
        if (name == null) {
            name = 'New Device'
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
            res.json(device);
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
            res.json({'message': 'Deleted device'});
        });
    });

    // Reset a device
    app.post('/api/devices/:device_id/reset', function(req, res) {
        Device.findOneAndUpdate({_id: req.params.device_id}, {$set: {
            duration: 0,
            distance: 0,
            address: '2203 Commerce St. Dallas, TX',
            lat: 32.7819473,
            lng: -96.7907082}}, {new: true},

            function(err, device) {
                if (err) {
                    res.send(err);
                }
                res.json(device);
            });
    });


    // Modify device stats
    app.post('/api/devices/:device_id/log_trip', function(req, res) {

    });

    // Drive page
    app.get('/drive', function(req, res) {
        res.sendFile(path.join(__dirname, '../public/views', 'drive.html'));
    })

    // Home page
    app.get('*', function(req, res) {
        res.sendFile('./public/index.html');
    });
};
