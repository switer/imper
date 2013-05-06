

/**
*	FileSystem APIS of web.fs
**/
define('webfs/fs',['webfs/fs/util'], function (util) {

	var _requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem,
		Blob_Object = window.Blob;
	var config = {
			CREATE_ENTRY_OPTIONS : {
				create : true,
				exclusive : true
			},
			READ_ENTRY_OPTIONS : {
				create : false,
				exclusive : false
			},
			CREATE_OVERRIDE_ENTRY_OPTIONS : {
				create : true,
				exclusive : false
			}
		}
		, _this = {};

	_this._fsInstance = null;
	_this._cacheDirectories = {};
	//Peroperties
	/*W3C File Error Code*/
	var errorCodeMap = {
			'1' : 'NOT_FOUND_ERR',
			'2' : 'SECURITY_ERR',
			'3' : 'ABORT_ERR',
			'4' : 'NOT_READABLE_ERR',
			'5' : 'ENCODING_ERR',
			'6' : 'NO_MODIFICATION_ALLOWED_ERR',
			'7' : 'INVALID_STATE_ERR',
			'8' : 'SYNTAX_ERR',
			'9' : 'INVALID_MODIFICATION_ERR',
			'10' : 'QUOTA_EXCEEDED_ERR',
			'11' : 'TYPE_MISMATCH_ERR'
	},
	/*Phonegap File Error Code*/
	phonegapErrorCodeMap = {
		'1' : 'NOT_FOUND_ERR',
		'2' : 'SECURITY_ERR',
		'3' : 'ABORT_ERR',
		'4' : 'NOT_READABLE_ERR',
		'5' : 'ENCODING_ERR',
		'6' : 'NO_MODIFICATION_ALLOWED_ERR',
		'7' : 'INVALID_STATE_ERR',
		'8' : 'SYNTAX_ERR',
		'9' : 'INVALID_MODIFICATION_ERR',
		'10' : 'QUOTA_EXCEEDED_ERR',
		'11' : 'TYPE_MISMATCH_ERR',
		'12' : 'PATH_EXISTS_ERR'
	}
	/*Directory Entry Cache*/
	function cacheDirectory (directory, entries) {
		_this._cacheDirectories[util.urlParse(directory.fullPath)] = entries;
	}
	/*Get A Directory Cache By Directory*/
	function getCacheDirectory (directory) {
		return _this._cacheDirectories[util.urlParse(directory.fullPath)];
	}
	/*Remove A Directory Cache By Directory*/
	function removeCacheDirectory (directory) {
		_this._cacheDirectories[util.urlParse(directory.fullPath)] = null;
	}

	/*Public Method*/
	//create a file
	function link (filename, cwd, success, error, options) {
		var type = config.CREATE_ENTRY_OPTIONS;
		if (options && options.override) type = config.CREATE_OVERRIDE_ENTRY_OPTIONS;
		cwd.getFile(filename, type, success, error)
	}
	// create a directory
	function mkdir (directoryname, cwd, success, error) {
		cwd.getDirectory(directoryname, config.CREATE_ENTRY_OPTIONS, success, error);
	}
	// delete a file
	function unlink (filename, cwd, success, error) {
		openfile(filename, cwd, function (file) {
			file.remove(success, error);
		}, error);
	}
	// get a file
	function openfile (filename, cwd, success, error) {
		cwd.getFile(filename, config.READ_ENTRY_OPTIONS, success, error);
	}
	// get a directory
	function opendir (directoryname, cwd, success , error ) {
		cwd.getDirectory(directoryname, config.READ_ENTRY_OPTIONS, success, error);
	}
	// remove a directory -r
	function rmdir (directoryname, cwd, success, error) {
		opendir(directoryname, cwd, function (directory) {
			directory.removeRecursively(success, error);
		}, error);
	}
	// create a file and write conent
	function writefile (filename, cwd, content, success , error, options) {
		link(filename, cwd, function (file) {
			file.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    success(file);
                };
                fileWriter.onerror = function(e) {
                    error('Write failed: ' + e.toString());
                };
                try {
                	//throw an error in mobile chrome 18 or phonegap
                	fileWriter.write(new Blob([content], {type: "text/plain;charset=UTF-8"}));
                } catch (e) {
					//Runing Good in Phonegap
					fileWriter.write(content);
                }
            }, error);
		} , error, options);
	}
	/**
	*	Open a dir 
	*	@return entries
	**/
	function readdir (directory, success, error) {
		if (directory.isDirectory) {
			directory.createReader({}).readEntries(function (entries) {
				success(entries)
			}, error);
		}
		else {
			error && error("Not a directory entry !");
		}
	}
	/**
	*	Open a file
	**/
	function readfile (fileEntry, encoding, success, error) {

		var reader = new FileReader();
		if (fileEntry.isFile) {
			fileEntry.file(function (file) {

				reader.readAsText(file, encoding);

				reader.onload = success;
	  			reader.onerror = error;
			}, error);

		}
		else {
			error && error("Not a File entry !");
		}
	}
	/**
	*	往指定路径上写一个文件
	**/
	function writeFileInPath (path, filename, content, success, error, options) {
		filesystem(window.TEMPORARY, function (fs) {
			var root = fs.root.toURL(),
				rootPath = root.match(/.*\/$/) ? root : root + '/';
			path = path.match(/.*\/$/) ? path : path + '/';
			path = path.replace(new RegExp('^' + rootPath), './'); 
			opendir(path, fs.root, function (directoryEntry) {
				openfile(filename, directoryEntry, function () {
					//先把旧文件删除
					unlink (filename, directoryEntry, function () {
						writefile(filename, directoryEntry, content, success, error, options)
					}, error) 
				}, function () {
					writefile(filename, directoryEntry, content, success, error, options);
				});
			}, error)
		}, error);
	}
	/**
	*	Rquest FileSystem
	*	Use singleton Parttern
	*	@param storageType <TEMPORARY, PERSISTENT>
	**/
	function filesystem (storageType, success, error) {

		if ( !_this._fsInstance ) {
			_requestFileSystem(storageType, 1024 * 1024, function (fs) {

				_this._fsInstance = fs;
				success(_this._fsInstance);

			}, error);
			/* PC persistent storage*/
			// window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
			//   window.webkitRequestFileSystem(PERSISTENT, grantedBytes, success, error); 
			// }, error);
		} else success(_this._fsInstance);
	}

	return {
		"link" 			: link,
		"mkdir" 		: mkdir,
		"unlink" 		: unlink,
		"rmdir" 		: rmdir,
		"readfile" 		: readfile,
		"readdir" 		: readdir,
		"openfile" 		: openfile,
		"opendir" 		: opendir,
		"writefile" 	: writefile,
		'filesystem' 	: filesystem,
		"errorCodeMap" 	: errorCodeMap,
		"phonegapErrorCodeMap" : phonegapErrorCodeMap,
		"writeFileInPath" : writeFileInPath
	};
});

/**
*	UI of web.fs
**/
define('webfs/ui', 
		['webfs/fs', 'webfs/ui/dom', 'webfs/fs/util'], 
			function (webfs, webdom, util) {
				
	var _this = {}, //custom scope

		conf = {
			'MAX_FILE_NAME_LENGTH' : 8
		}

	_this._cwds = {};
	_this._root = '';
	_this._delIconVisi = {};

	// ICON Item HTML Template
	var  iconHtml = "<div data-type='@{fileType}' data-path='@{path}' data-event='icon-event' class='fs-icon @{iconType}' >"
					+ "<div data-event='icon-event' class='fs-icon-img @{iconClass}'></div>"
				 	+ "<a data-event='icon-event' class='fs-icon-name'>@{name}</a>"
				 	+ "<a class='fs-icon-opt fs-icon-opt-download @{downloadVisibleClass}' download='@{name}' href='@{fullPath}' ></a>"
				 	+ "<a class='fs-icon-opt fs-icon-opt-upload @{downloadVisibleClass}' data-file='@{path}' ></a>"
				 	+ "<button data-event='icon-del' class='fs-icon-opt fs-icon-opt-del @{visibleClass}'></button>"
				 	+ "</div>";

	// ROOT and Back Item HTML Template
	var  backIconHtml = "<div data-type='@{fileType}' data-path='@{path}' data-event='icon-event' class='fs-icon @{iconType}' >"
					  + "<div data-event='icon-event' class='fs-icon-img'></div>"
				 	  + "<a data-event='icon-event' class='fs-icon-name'>@{name}</a>"
				 	  + "</div>";

	/*Set Current UI Work Directory*/
	function setCwd (cwd, container) {
		_this._cwds[container] = cwd;
	}
	/*Get Current UI Work Directory*/
	function getCwd (container) {
		return _this._cwds[container];
	}
	/*Handle Error in Common*/
	function errorHanlder (error, msg) {
		if (error) return error;
		return function (e) {
			console.log(msg);
			if (typeof e == 'string') throw new Error(e);
			else console.log('Error : ' + e.code);
		}
	}
	/*初始化文件的打开事件操作*/
	function initFileOperation (eventType, container, error) {
		var handle;
		switch (eventType) {
			case 'click':
			case 'touchstart': 
				handle = function (e) {
					var $tar = $(e.target)
						, $parent;
					if ($tar.data('path')) $parent = $tar;
					else $parent = $tar.parent();

					if ($tar.data('event') !== "icon-event") return;
					if ($parent.data('type') === 'directory') {
						if ($parent.data('path') === '.') return;
						renderDirectorPath($parent.data('path'), container, null, error);
					} else {
						try {
							// window.open(getCwd(container).toURL()+ '/' + $parent.data('path'),'view:file', 'resize=yes,scrollbar=yes,status=yes')
							window.open(getCwd(container).toURL()+ '/' + $parent.data('path'),'_blank')
						} catch (e) {
							window.open(getCwd(container).toURL()+ '/' + $parent.data('path'),'_blank')
						}
						
					}
				};
				break;
		}
		$(container).on(eventType, handle);
	}

	/*删除文件的事件操作*/
	function initIconDel (eventType, container, error) {

		var delBtnSel = '.fs-icon-opt-del';

		var handle = function (e) {

			var $optBtn = $(e.target),
				$parent = $optBtn.parent();

			if ($optBtn.data('event') !== "icon-del") return;
			// Delete A File Item DOM
			webfs[$parent.data('type') === 'file' ? 'unlink' : 'rmdir'](
					$parent.data('path'), getCwd(container)
					, function () {
						
						$parent.animate({
						  "height" : 1,
						  "opacity" : 0.1
						}, {
							duration : 300,
							easing : 'ease-out',
							"complete" : function () {
								$parent.remove();
							}
						});
					}
					, errorHanlder(error))
		}

		$(container).on( eventType, delBtnSel, handle);
	}
	/*显示删除按钮*/
	function showDelStatus (container) {
		if ( _this._delIconVisi[container] )  {

			_this._delIconVisi[container] = false;
			webdom.hideDelIcon(container);
		}
		else {
			_this._delIconVisi[container] = true;
			webdom.showDelIcon(container);
		}
	}
	/*创建一个目录*/
	function mkdir (directoryname, container, success, error) {
		webfs.mkdir(directoryname, getCwd(container), function (file) {
			insertFileDOM(container, file);
			success && success();
		}, errorHanlder(error, 'UI:mkdir / FS:mkdir'));
	}
	/*创建一个文件*/
	function writeFile (filename, content, container, success, error) {
		webfs.writefile(filename, getCwd(container), content, function (file) {
			insertFileDOM(container, file);
			success && success(file);
			
		}, errorHanlder(error, 'UI:writeFile / FS:writefile'));
	}
	/*插入一个文件项目DOM*/
	function insertFileDOM (container, file) {
		document.body.scrollTop = document.body.scrollHeight;
		var contElem = $(container)[0]
			, fileType = file.isDirectory ? 'directory' : 'file'
			, iconType = file.isDirectory ? 'fs-icon-folder' : 'fs-icon-file'
			, name = file.name
			, iconClass = util.suffix(file.name).length > 0 && !file.isDirectory ? ' fs-icon-type-' + util.suffix(file.name) : ''
			, html = util.render({
				"fileType" : fileType,
				"name" : name,
				"iconType" : iconType,
				"iconClass" : iconClass,
				"path" : name,
				"visibleClass" : _this._delIconVisi[container] ? '' : 'fs-visi-hide',
				'fullPath' : file.toURL(),
				'downloadVisibleClass' : !file.isDirectory ? '' : 'fs-visi-hide'
			}, iconHtml);
		$(container).append(html);
	}
	/*渲染根目录API，也是webfs的启动函数*/
	function renderRoot(type, container, success, error, options) {
		webfs.filesystem(type,
			function(fs) {
				_this._root = fs.root.toURL();
				setCwd(fs.root, container);
				webfs.readdir(fs.root, 
					function (entries) {
						renderDirector(entries, container, success, options);
					}
				);
			},
		errorHanlder(error, 'UI:renderRoot / FS:filesystem'));
	}
	/*渲染一个目录路径API，可用于打开子目录*/
	function renderDirectorPath (path, container, success, error, options) {
		if (path === getCwd(container).toURL()) path = './';
		window.timeDate = new Date();
		webfs.opendir(path, getCwd(container), function (entry) {
			if (entry.isDirectory) {
				setCwd(entry, container);
				webfs.readdir(entry, 
					function(entries) {
						renderDirector(entries, container, success, options);
					},
				errorHanlder(error, 'UI:renderDirectorPath / FS:readdir'));
			}
		}, errorHanlder(error, 'UI:renderDirectorPath / FS:opendir'))
	}
	/*渲染目录*/
	function renderDirector (entries, container, success, options) {
		//render 目录前先把删除按钮状态设为隐藏
		_this._delIconVisi[container] = false;

		var html = ""
			, iconContent
			, parentPath
			, rootname
			, rootpath
			, iconType;

		/*目录项要指定渲染*/
		if ( util.urlParse(getCwd(container).toURL()) !== util.urlParse(_this._root) ) {
			rootname = 'Back';
			rootpath = '..';
			iconType = 'fs-icon-back';
		}
		else {
			rootname = 'Root';
			rootpath = '.';
			iconType = 'fs-icon-back fs-icon-root';
		}
		html += util.render({
				"fileType" : 'directory',
				"name" : rootname,
				"iconType" : iconType,
				"path" : rootpath
			}, backIconHtml);

		_.each(entries, function (item, index) {

			var fileType = item.isDirectory ? 'directory' : 'file',
				iconType = item.isDirectory ? 'fs-icon-folder' : 'fs-icon-file',
				name = item.name,
				//匹配文件类型的图片样式
				iconClass = util.suffix(name).length > 0 && !item.isDirectory ? ' fs-icon-type-' + util.suffix(name) : '';

				if ( options && options.filter) {
					if (item.name.match(options.filter)) return
				}
			iconContent =  util.render({
						"fileType" : fileType, //文件类型
						"name" : name,//文件名
						"iconType" : iconType,//图片类型
						"iconClass" : iconClass,//图片样式Class
						"path" : name,//文件路径
						//指定删除是否可见
						//TODO 可优化点
						"visibleClass" : _this._delIconVisi[container] ? '' : 'fs-visi-hide',
						'fullPath' : item.toURL(),
						'downloadVisibleClass' : !item.isDirectory ? '' : 'fs-visi-hide'
					}, iconHtml)
			html += iconContent;
		});
		$(container).html( html );
		success && success(entries);
	}

	/*public methods*/
	return {
		//event
		"initFileOperation" 	: initFileOperation,
		"initIconDel" 			: initIconDel,
		//UI render
		"renderRoot" 			: renderRoot,
		"renderDirectorPath" 	: renderDirectorPath,
		"renderDirector" 		: renderDirector,
		//method
		"mkdir" 				: mkdir,
		"writeFile" 			: writeFile,
		"showDelStatus" 		: showDelStatus,
		//cache
		"getCwd"				: getCwd
	}
});
/**
*	web.fs util
**/
define('webfs/fs/util', function () {
	/*解析替换URL中的.或..*/
	function urlParse (url) {
		var path = [];
		_.each(url.split('/'), function (item) {
			if (item=='..') path.pop();
			else if (item !== '.') path.push(item);
		});
		return path.join('/');
	}

	/*获取文件的后缀名*/
	function suffix (filename) {
		var namefrag = filename.toLowerCase().split('.'),
			suf = namefrag.length > 1 ? namefrag.pop() : '';
		return suf;
	}
	/*模板渲染*/
	function render (collection, str) {
		var regs = [];
		_.each(collection, function (item, key) {
			regs.push({key : new RegExp('@\{' + key + '\}', 'g'), value: item});
		})
		for (var i = regs.length - 1; i >= 0; i--) {
			str = str.replace(regs[i]['key'], regs[i]['value']);
		};
		return str;
	}
	return {
		"urlParse": urlParse,
		"suffix" : suffix,
		"render" : render
	}
	
});
/**
*	DOM Manual for webfs/ui
**/
define('webfs/ui/dom', function () {
	var conf = {
		'del_icon_sel' : '.fs-icon-opt-del'
	};
	return {
		'showDelIcon' : function (container) {
			$(container).find(conf.del_icon_sel).css('visibility', 'visible');
		},
		'hideDelIcon' : function (container) {
			$(container).find(conf.del_icon_sel).css('visibility', 'hidden');
		}
	}
});

/**
*	Web.fs Library
**/
define('webfs',['webfs/fs', 'webfs/ui'], function (webfs, webui) {
	return {
		'webfs' : webfs, //封装的文件系统API库
		'webui' : webui //文件系统UI API库
	}
});
