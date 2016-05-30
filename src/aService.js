class aService {
    constructor (params) {
        var self = this;

        self._params = params;
    }

    call (callback) {
        var self = this;

        if (self._authenticate()) {
            self._execute(callback);
        }
        else {
            callback({
                success: false,
                message: 'Permission denied.'
            });
        }
    }
    
    _authenticate () {
        var self = this;
        let validUsers = rootRequire('config/service').validUsers;
        let authenticated = false;

        if (self._params.username && self._params.password) {
            validUsers.forEach(function (user) {
                if (self._params.username === user.username && self._params.password === user.password) {
                    authenticated = true;
                }
            });
        }

        return authenticated;
    }

    _execute () {}
};

module.exports = exports = aService;