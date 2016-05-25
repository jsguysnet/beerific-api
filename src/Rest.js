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
    })
    
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
}

module.exports = exports = Rest;
