class Rest {
  constructor(webserver, database, bodyParser, config) {
    this._webserver = webserver;
    this._database = database;
    this._bodyParser = bodyParser;
    this._config = config;
    
    this._lastError = null;
  }
  
  initRoute() {
    let self = this;
    
    self._webserver.post('/', (req, res) => {
      let query = req.body.query;
      
      self._query(query, (data) => {
        self._respond(res, data);
      });
    });
    
    self._webserver.get('/:table/:id?', (req, res) => {      
      let table = req.params.table.replace(/[^a-z_]+/i, '');
      let id = parseInt(req.params.id);
      
      let query = 'SELECT * FROM ' + table;
      if (id) {
        query += ' WHERE id = ' + id;
      }
      
      self._query(query, (data) => {
        self._respond(res, data);
      });
    });

    // service router
    self._webserver.post('^/:version(latest|[0-9]\.[0-9])/:module([a-z\-]+)/:action([a-z\-]+).service$', (req, res) => {
      self._callService(req.params, req.body, res);
    });
  }

  start() {
    this._webserver.use(this._bodyParser.json());
    this._webserver.use(this._bodyParser.urlencoded({extended: true}));
    
    this.initRoute();
    
    this._webserver.listen(this._config.port);
  }
  
  stop() {
    
  }
  
  _query(query, callback) {
    let self = this;
    
    // TODO escape query
    
    self._database.connect();
    self._database.query(query, (data, error) => {
      if (!error) {
        callback(data);
      }
      else {
        self._lastError = error;
        callback(false);
      }
    });
    self._database.disconnect();
  }
  
  _respond(res, data) {
    let self = this;

    if (data && data.hasOwnProperty('success')) {
      res.status(data.success ? 200 : 500).json(data);
      return;
    }

    let json = {
      success: true
    };
    
    if (data) {
      json.data = data;
    }
    else {
      json.success = false;
      
      if (self._lastError) {
        json.message = self._lastError.message;
        json.message = json.message.substr(json.message.indexOf(':') + 1).trim();
      }
      else {
        json.message = 'An unknwon error occurred.';
      }
    }
    
    res.status(json.success ? 200 : 500).json(json);
  }

  _callService(callParams, serviceParams, response) {
    let self = this;
    let serviceConfig = rootRequire('config/service').service[0];

    if (!serviceConfig.hasOwnProperty(callParams.module + '.' + callParams.action)) {
      return {
        success: false,
        message: 'Service is unavailable.'
      };
    }

    // get external dependencies
    let dependencies = serviceConfig[callParams.module + '.' + callParams.action][0]['dependencies'];

    if (dependencies) {
      dependencies = dependencies[0];

      for (var key in dependencies) {
        serviceParams[key] = self[dependencies[key]];
      }
    }
    //TODO version einbauen

    callParams.action = callParams.action[0].toUpperCase() + callParams.action.substr(1);
    
    let Service = rootRequire('/service/' + callParams.module + '/' + callParams.action);
    
    let service = new Service(serviceParams);
    service.call((data) => {
      self._respond(response, data);
      return;
    });
  }
}

module.exports = exports = Rest;
