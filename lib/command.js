var util	= require('util'),
	extend  = require('extend'),
	response= require('./response');

var Command = function(cmd, args, cb){
	this.cmd = cmd || "INVA";
	if(typeof args!=='object' && typeof args!=='undefined' && args!==null){
		args = [args];
	}
	this.args = args;
	this.cb = cb;
}

Command.prototype.toString = function(){
	var str = this.cmd;

	if(this.args && this.args.length){
		str += ':'
		for(var i=0; i<this.args.length; i++){
			str += this.args[i];
		}
	}

	return str;
}

Command.prototype.handleResponse = function(resp){
	//no callback, so return
	if(!this.cb) return;

	if(resp.isError()){
		this.cb(resp.getError());
		return;
	}

	//it is a positive reply
	if(resp.data==this.cmd){
		this.cb(null);
		return;
	}

	var args = this.formatResult(resp.data, resp.getArgs());
	if(util.isArray(args)){
		args.unshift(null);
	}else{
		args = [null, args];
	}

	this.cb.apply(null, args);
}

Command.prototype.formatResult = function(data, args){
	return args;
}

/************* POWER ************/
Command.PowerCommand = function(){
	var cb;
	//query by default
	var cmd = 'QPW';
	var data = [];
	var args = Array.prototype.slice.call(arguments, 0);

	if(typeof args[args.length-1]==='function') cb = args.pop();

	if(args.length>0){
		if(args[0]===true){
			cmd = 'PON'; //turn on
		}else{
			cmd = 'POF'; //turn off
		}
	}


	Command.call(this, cmd, data, cb);
}

util.inherits(Command.PowerCommand, Command);

Command.PowerCommand.prototype.formatResult = function(data, args){
	return parseInt(data)>0;
}


/************* FREEZE ************/
Command.FreezeCommand = function(){
	var cb;
	//query by default
	var cmd = 'QFZ';
	var data = [];
	var args = Array.prototype.slice.call(arguments, 0);

	if(typeof args[args.length-1]==='function') cb = args.pop();

	if(args.length>0){
		cmd = 'OFZ';
		if(args[0]===true){
			data = 1;
		}else{
			data = 0;
		}
	}


	Command.call(this, cmd, data, cb);
}
util.inherits(Command.FreezeCommand, Command);

Command.FreezeCommand.prototype.formatResult = function(data, args){
	return parseInt(data)>0;
}

/************* SHUTTER ************/
Command.ShutterCommand = function(){
	var cb;
	//query by default
	var cmd = 'QSH';
	var data = [];
	var args = Array.prototype.slice.call(arguments, 0);

	if(typeof args[args.length-1]==='function') cb = args.pop();

	if(args.length>0){
		cmd = 'OSH';
		if(args[0]===true){
			data = 1;
		}else{
			data = 0;
		}
	}


	Command.call(this, cmd, data, cb);
}
util.inherits(Command.ShutterCommand, Command);

Command.ShutterCommand.prototype.formatResult = function(data, args){
	return parseInt(data)>0;
}



module.exports = Command;