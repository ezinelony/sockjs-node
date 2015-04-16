function DataManager(url, connectionType){
	this.url = url;
	this.connectionType = connectionType || "websocket";
};

DataManager.prototype.getConnection = function( callback ) {
	
 
	var connection = this.connection || this.connectionType === "websocket" ? this.openSocket( callback ) : this.xmlhttpRequest( callback );
	return connection;
};

DataManager.prototype.openSocket = function( callback ) { 
	var sockjs = new SockJS(this.url);
	sockjs.onopen    = function()  {print('[*] open', sockjs.protocol);};
    sockjs.onmessage = function(e) {
		//print('[.] message', e.data);
		callback.func.apply(callback.context, [e.data]);
	};
    sockjs.onclose   = function()  { 
		print('[*] close');
	};
	
	this.connection = sockjs;
	return sockjs;
};

//xmlhttprequest
DataManager.prototype.xmlhttpRequest = function( callback ) { 
	var url = this.url;
	return {send : function ( ajaxParams ){
		var request = jQuery.ajax({
			url: url,
			method: ajaxParams.method || "GET",
			data: ajaxParams.data
			//dataType : "json",
			
		});
		request.then(
			function( data ){ //resolve rsvp
				callback.func.apply(callback.context, [data]);
			},
			function( jqXHR, textStatus, errorThrown ){
				if(callback.fail && callback.fail.func) {
					callback.fail.func.apply(callback.fail.context, [jqXHR, textStatus, errorThrown]);
				} else{
					console.log(errorThrown);
				}
			}
		);
		/*
		request.done = function( data ){
			callback.func.apply(callback.context, [data]);
		};
		request.fail = function( jqXHR, textStatus, errorThrown ){
			if(callback.fail && callback.fail.func && callback.fail.context) {
				callback.fail.func.apply(callback.fail.context, [jqXHR, textStatus, errorThrown]);
			} else{
				console.log(errorThrown);
			}
		};
		
		*/
		request.dataFilter = function( data, dataType) {
			if(callback.serialize && callback.serialize.func) {
				return callback.serialize.func.apply(callback.serialize.context, [data, dataType]);
			}
			return data;
		}
			 
		return request;
	}
 };
};
//search
DataManager.prototype.search = function(data, callback ) {
	var connection = this.getConnection(callback);
	console.log(connection);
	var interval;
	if(connection.readyState && connection.readyState !== 1){
		 interval = setInterval(function(){
			 
		  if(connection.readyState === 1){
				connection.send(data);
		    	clearInterval(interval);
			}
		   		
		}, 300);
	} else {
		connection.send(data);
	}

};