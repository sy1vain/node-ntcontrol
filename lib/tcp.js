var NTControl	= require('./ntcontrol'),
	util 		= require('util'),
	net 		= require('net'),
	extend 		= require('extend'),
	crypto 		= require('crypto'),
	ntresponse 	= require('./response');


var defaultOptions = {
	"host": "192.168.1.1",
	"port": 4352,
	"user": null,
	"password": null,
	"timeout": 500
}

var TCP = function(options){
	NTControl.call(this);

	extend(true, this.options, defaultOptions, options);

}
util.inherits(TCP, NTControl);

var proto = TCP.prototype;

proto._connection = null;

proto._sendCommand = function(command){

	var msg = '00' + command.toString();

	if(this._digest){
		msg = this._digest + msg;
		this._digest = null; //always reset after first send
	}

	this._connection.write(msg + "\r");
}

proto._onData = function(data){
	if(typeof data=='object' && data.toString) data = data.toString();

	//cut of trailing \r
	data = data.trim();
	//cut off id
	if(data.indexOf('00')==0) data = data.substr(2);

	var response = ntresponse.parse(data);

	this._handleResponse(response);
}

var __handleResponse = proto._handleResponse;
proto._handleResponse = function(response){
	
	if(response.data==ntresponse.AUTH){
		if(response.hasArgs() && response.getArgs()[0]==1){
			this._digest = this._calcDigest(response.getArgs()[1]);
		}
		return;
	}

	__handleResponse.call(this, response);
}

//** PRIVATE FUNCTIONS **/
proto._isConnected = function(){
	return !!this._connection;
}

proto._connect = function(){
	this._connection = net.connect({port: this.options.port, host: this.options.host}, this._onConnect.bind(this));
	this._connection.on('data', this._onData.bind(this));
	this._connection.on('error', this._onError.bind(this));
	this._connection.on('close', this._onClose.bind(this));
	this._connection.on('timeout', this._onTimeout.bind(this));
	this._connection.setTimeout(this.options.timeout);
	this._connection.setNoDelay(true);
}

proto._onConnect = function(){
	this._sendNextCommand();
}

proto._onTimeout = function(){
}

proto._calcDigest = function(rand){
	if(!this.options.user || !this.options.password) return null;

	var md5 = crypto.createHash('md5');
	md5.setEncoding('hex');
	md5.write(this.options.user);
	md5.write(':');
	md5.write(this.options.password);
	md5.write(':');
	md5.end(rand);
	return md5.read();
}

proto._onError = function(err){
	this._handleResponse(new ntresponse(null, err.message));
}

proto._onClose = function(had_error){
	this._resetConnection();
}

proto._resetConnection = function(){
	if(this._cmdWaiting){
		this._handleResponse(new ntresponse(null, ntresponse.getError(ntresponse.ERRORS.ERRD)));
	}

	//reset the connection etc
	this._connection = null;
	process.nextTick(this._sendNextCommand.bind(this));
}

module.exports = TCP;
