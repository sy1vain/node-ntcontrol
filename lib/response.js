var Response = function(data, err, args){
	this.data = data;
	this.err = err;
	this.args = args;

	if(args && typeof this.args!=='object'){
		this.args = [this.args];
	}
}

Response.AUTH = 'NTCONTROL';

Response.ERRORS = {
	'OK': null,
	'ER401': 'Undefined command',
	'ER402': 'Undefined command',
	'ERRA': 'Authorization failed',
	'ERRM': 'Command reply mismatch',
	'ERRD': 'Not connected'
}

Response.prototype.isError = function(){
	return this.err!==null && typeof this.err!=='undefined';
}

Response.prototype.getError = function(){
	if(!this.isError()) return null;

	if(typeof this.err == 'object') return this.err;

	return Response.getError(this.err);
}

Response.getError = function(err){
	if(!err) return null;
	return new Error(err);
}

Response.prototype.hasArgs = function(){
	return this.args && this.args.length>0;
}

Response.prototype.getArgs = function(){
	return this.args;
}

Response.parse = function(data){
	var cmd, err, args;
	var args = data.split(' ');
	var cmd = args.shift();

	if(Response.ERRORS.hasOwnProperty(data)){
		err = new Error(Response.ERRORS[data]);
		cmd = null;
		args = null;
	}

	return new Response(cmd, err, args);
}

Response.prototype.cmd = null;
Response.prototype.args = null;
Response.prototype.cls = 1;

module.exports = Response;
