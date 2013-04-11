/**
 * @author guan
 * 
 * modules and events managementf
 */
var Core = (function() {
	/**
	 * store obj of module
	 * obj: {
	 * 		{function} creator, 
	 * 		{object} instance, 
	 * 		{SandBox} sandBox, 
	 * 		{function(data:object)} events
	 * }
	 * 
	 * creator: function for creating instance of module
	 * instance: instance of module
	 * sandBox: sandBox used by module
	 * events: events registered by module
	 */
	var modules = {}, 
	events = {}, 
	elemEvents = {};
	return {
		/**
		 * register module by moduleName and its creator function,
		 * but do not start
		 * 
		 * @param {string} moduleName 
		 * 		module name and also the DOM container id
		 * 		of this module
		 * 
		 * @param {function(sandBox:SandBox, ...)} creator
		 * 		function for creating the module
		 * 
		 */
		registerModule: function(moduleName, creator) {
			if(!moduleName || !creator) {
				this.log("Core.registerModule: module name and creator should be defined");
				return;
			}
			if(modules[moduleName]) {
				this.log("Core.registerModule: module '" + moduleName + "' is already existed");
				return;
			}
			module = modules[moduleName] = {
				creator: creator,
				instance: null,
				sandBox: new SandBox(this, moduleName),
				events: []
			};
		},
		/**
		 * start module which have been registered and have not been started,
		 * invoke creator of module and init function of module instance
		 * 
		 * @param {string} moduleName
		 * 		module name
		 * @param {...*} varArgs
		 * 		extra parameters should be passed to creator if is necessary
		 */
		start: function(moduleName, varArgs) {
			var module = modules[moduleName];
			if(!module) {
				this.log("Core.start: module '" + moduleName + "' has not been registered");
				return;
			}
			if(module.instance) {
				return;
			}
			var args = [];
			args.push(module.sandBox);
			for(var i = 1, arg; arg = arguments[i]; i++) {
				args.push(arg);
			}
			module.instance = module.creator.apply(this, args);
			module.instance.init();
		},
		/**
		 * stop module which have already been started,
		 * invoke destroy function of module instance and ignore all events
		 * registered by this module
		 * 
		 * @param {string} moduleName
		 * 		module name
		 */
		stop: function(moduleName) {
			var module = modules[moduleName];
			if(!module || !module.instance) {
				return;
			}
			module.instance.destroy();
			for(var evt in module.events) {
				this.unregisterEvent(moduleName, evt);
			}
			module.instance = null;
		},
		/**
		 * start all modules if the module has not been started before
		 * 
		 * @param {object} extraParams
		 * 		extra parameters should be passed to 
		 * 		module specified by moduleName
		 * 		extraParams: {{string} moduleName: {Array} params}
		 */
		startAll: function(extraParams) {
			for(var moduleName in modules) {
				var module = modules[moduleName];
				//这里if + continue可以替换if else
				if(module && module.instance) {
					continue;
				}
				//js特色的三元运算，有效地减少了if else分支的应用
				var args = [], 
					extra = extraParams ? extraParams[moduleName] : undefined;
				args.push(moduleName);
				if(extra) {
				//这样的循环性能更好
					for(var i = 0, t; t = extra[i]; i++) {
						args.push(t);
					}
				}
				this.start.apply(this, args);
			}
		},
		/**
		 * stop all modules
		 */
		stopAll: function() {
			for(var moduleName in modules) {
				this.stop(moduleName);
			}
		},
		/**
		 * register event of module
		 * 
		 * @param {string} moduleName
		 * 		module name
		 * @param {string} evt
		 * 		event name
		 * @param {function(data:object)} fn
		 *		function to be invoked when this event is triggered 		
		 */
		registerEvent: function(moduleName, evt, fn) {
			var module = modules[moduleName];
			if(!module || !module.instance) {
				this.log("Core.registerEvent: module '" + moduleName + "' does not exist");
				return;
			}
			if(!fn || typeof fn != "function") {
				this.log("Core.registerEvent: module '" + moduleName + "' register a undefined function");
				return;
			}
			var oldFn = module.events[evt];
			if(oldFn) {
				this.unregisterEvent(moduleName, evt);
			}
			module.events[evt] = fn;
			var fns = events[evt];
			if(!fns) {
				fns = [];
				events[evt] = fns;
			}
			fns.push(fn);
		},
		/**
		 * unregister event of module
		 * 
		 * @param {string} moduleName
		 * 		module name
		 * @param {string} evt
		 * 		event name
		 */
		unregisterEvent: function(moduleName, evt) {
			var module = modules[moduleName];
			if(!module || !module.instance) {
				this.log("Core.unregisterEvent: module '" + moduleName + "' does not exist");
				return;
			}
			var fn = module.events[evt], fns = events[evt];
			if(fn && fns) {
				for(var i = 0, tmpFn; tmpFn = fns[i]; i++) {
					if(tmpFn == fn) {
						fns.splice(i, 1);
						break;
					}
				}
				if(fns.length == 0) {
					delete events[evt];
				}
			}
			delete module.events[evt];
		},
		/**
		 * trigger event
		 * 
		 * @param {object} evtObj
		 * 		evtObj: {{string} type, {object} data}
		 * 				type: event name
		 * 				data: parameter should be passed to event function
		 */
		triggerEvent: function(evtObj) {
			var type = evtObj.type, data = evtObj.data;
			if(!type) {
				this.log("Core.triggerEvent: please specify the type of event");
				return;
			}
			var fns = events[type];
			if(!fns) {
				return;
			}
			for(var i = 0, fn; fn = fns[i]; i++) {
				fn(data);
			}
		},
		/**
		 * bind event to element
		 * 
		 * @param {object} obj
		 * @param {string} eventName
		 * @param {Function} fn
		 */
		bind: function(obj, eventName, fn) {
			if(!obj) {
				this.log("Core.bind: obj should not be null");
				return;
			}
			if (obj.addEventListener) {
				obj.addEventListener(eventName, fn, false);
				return;
			}
			eventName = "on" + eventName;
			var event = obj[eventName], fns = elemEvents[event];
			if(!fns) {
				fns = [];
				event = obj[eventName] = function() {
					for(var i = 0, evt; evt = fns[i]; i++) {
						evt();
					}
				};
				elemEvents[event] = fns;
			}
			fns.push(fn);
		},
		/**
		 * unbind event from element
		 * 
		 * @param {object} obj
		 * @param {string} eventName
		 * @param {Function} fn
		 */
		unbind: function(obj, eventName, fn) {
			if(!obj) {
				this.log("Core.bind: obj should not be null");
				return;
			}
			if (obj.removeEventListener) {
				obj.removeEventListener(eventName, fn, false);
				return;
			}
			eventName = "on" + eventName;
			var fns = elemEvents[obj[eventName]];
			if(fns) {
				for(var i = 0, evt; evt = fns[i]; i++) {
					if(evt == fn) {
						fns.splice(i, 1);
						i--;
					}
				}
			}
		},
		/**
		 * log
		 * 
		 * @param msg log message
		 */
		log: function(msg) {                    
//			alert("LOG [ " + msg + " ]");
		}
	};
})();
