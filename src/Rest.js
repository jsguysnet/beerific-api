class Rest {
  constructor(webserver, database, bodyParser, config) {
    this._webserver = webserver;
    this._database = database;
    this._bodyParser = bodyParser;
    this._config = config;
  }
  
  initRoute() {
    let self = this;
    
    self._webserver.post('/', (req, res) => {
      let query = req.body.query;
      
      self._query(query, (data) => {
        res.json(data);
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
    self._database.query(query, callback);
    self._database.disconnect();
  }
}

module.exports = exports = Rest;
