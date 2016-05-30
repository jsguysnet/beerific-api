let aService = rootRequire('src/aService');



class Search extends aService {
    constructor(params) {
        super(params);

        this.EARTH_RADIUS = 6378.388;

        this._params.latitude = this._params.latitude || undefined;
        this._params.longitude = this._params.longitude || undefined;
    }

    _execute(callback) {
        let self = this;

        self._params.db.connect();

        self._params.db.query('SELECT * FROM v_beergarden_list', (data, error) => {
            if (!error) {
                // calculate distance
                if (self._params.latitude && self._params.longitude) {
                    for (var row in data) {
                        data[row].distance = self._getDistance(data[row].latitude, data[row].longitude);
                    }
                };

                callback(data);
            }
            else {
                self._lastError = error;
                callback(false);
            }
        });

        self._params.db.disconnect();
    }

    _getDistance (lat, lng, accuracy) {
        let self = this;

        let lat1 = (2*Math.PI / 360) * self._params.latitude;
        let lng1 = (2*Math.PI / 360) * self._params.longitude;
        let lat2 = (2*Math.PI / 360) * lat;
        let lng2 = (2*Math.PI / 360) * lng;

        let latProd = Math.sin(lat1) * Math.sin(lat2);
        let lngProd = Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2);
        let acc = accuracy ? Math.pow(10, accuracy) : 10;

        let distance = self.EARTH_RADIUS * Math.acos(latProd + lngProd);
        return Math.round(distance * acc) / acc;
    }
};

module.exports = exports = Search;