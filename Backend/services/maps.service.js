const axios = require('axios');
const captainModel = require('../models/captain.model');

// ---------------------------------------------------------------------------
// DEMO MODE: if GOOGLE_MAPS_API is not set, fake the Google calls so the whole
// ride flow (search -> fare -> request -> accept -> OTP -> finish) still works.
// Set a real key in Backend/.env to use real Google data.
// ---------------------------------------------------------------------------
const isDemo = () => !process.env.GOOGLE_MAPS_API;

const hash = (s) => {
    let h = 0;
    for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
};

const demoPlaces = [ 'Main Road', 'Railway Station', 'Airport', 'City Mall', 'Bus Stand', 'University' ];

module.exports.getAddressCoordinate = async (address) => {
    if (isDemo()) return { ltd: 18.5204, lng: 73.8567 };
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[ 0 ].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    if (isDemo()) {
        const meters = 2000 + (hash(origin + '|' + destination) % 13000);
        const seconds = Math.round(meters / 8);
        return {
            distance: { value: meters, text: (meters / 1000).toFixed(1) + ' km' },
            duration: { value: seconds, text: Math.round(seconds / 60) + ' mins' },
            status: 'OK'
        };
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {


        const response = await axios.get(url);
        if (response.data.status === 'OK') {

            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
        } else {
            throw new Error('Unable to fetch distance and time');
        }

    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    if (isDemo()) return demoPlaces.map(p => `${input} ${p}`);

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {

    // radius in km

    // Demo mode uses fake coordinates, so notify every connected captain.
    if (isDemo()) {
        return captainModel.find({ socketId: { $exists: true, $ne: null } });
    }


    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ ltd, lng ], radius / 6371 ]
            }
        }
    });

    return captains;


}