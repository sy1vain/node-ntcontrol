var Command 	= require('./command');

var NTControl = function(){
}

var proto = NTControl.prototype;

proto.options = {};
proto._cmdQueue = [];
proto._cmdWaiting = false;

/** POWER **/
proto.setPowerState = function(stateOn, cb){
	var cmd = new Command.PowerCommand(stateOn, cb);
	this._addCommand(cmd);
}

proto.getPowerState = function(cb){
	var cmd = new Command.PowerCommand(cb);
	this._addCommand(cmd);
}

/** FREEZE **/
proto.setFreezeState = function(stateOn, cb){
	var cmd = new Command.FreezeCommand(stateOn, cb);
	this._addCommand(cmd);
}

proto.getFreezeState = function(cb){
	var cmd = new Command.FreezeCommand(cb);
	this._addCommand(cmd);
}

/** SHUTTER **/
proto.setShutterState = function(stateOn, cb){
	var cmd = new Command.ShutterCommand(stateOn, cb);
	this._addCommand(cmd);
}

proto.getShutterState = function(cb){
	var cmd = new Command.ShutterCommand(cb);
	this._addCommand(cmd);
}





proto._handleResponse = function(response){
	//handle that shit!

	//no command waiting
	if(!this._cmdWaiting) return;

	if(this._cmdQueue.length>0){
		var cmd = this._cmdQueue.shift();
		cmd.handleResponse(response);
	}
	this._cmdWaiting = false;
}

//should be overridden
proto._sendCommand = function(){
}

//should be overridden
proto._isConnected = function(){
	return true;
}

//should be overridden
proto._connect = function(){
}

proto._addCommand = function(cmd){
	if(!cmd) return;

	this._cmdQueue.push(cmd);
	
	if(!this._cmdWaiting){
		this._sendNextCommand();
	}
}

proto._sendNextCommand = function(){
	if(this._cmdQueue.length==0) return;
	if(!this._isConnected()) return this._connect();
	if(this._cmdWaiting) return;

	this._cmdWaiting = true;

	this._sendCommand(this._cmdQueue[0]);
}

module.exports = NTControl;