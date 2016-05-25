class Database {
  constructor(driver, config) {
    this._driver = driver;
    this._config = config;
  }
  
  connect(config) {
    let self = this;
    
    self._connection = self._driver.createConnection({
      host     : self._config.host,
      user     : self._config.user,
      password : self._config.password,
      database : self._config.database
    });
  }
  
  disconnect() {
    this._connection.end();
  }
  
  query(query, callback) {
    this._connection.query(query, (err, rows, fields) => {
      callback(rows, err);
    });
  }
}

module.exports = exports = Database;
