module.exports.cleanSpace = function(string) {
	var text = string.trim();
    text = text.replace("'", "");
    while(text.indexOf(" ") > -1){
    	text = text.replace(" ", "-");
    }
    return text;
};

module.exports.remove_file = function(fs, path) {
	fs.exists(path, function(exists) {
		if(exists){
			fs.unlink(path, function(err) {
				if(err){
					return false;
				}else{
					return true;
				}
			});
		}else{
			return false;
		}
	});
};

module.exports.save_image = function(multer, path, dir) {
	return new Promise(function(resolve, reject) {
		try{
			var storage = multer.diskStorage({
				destination: (req, file, callback) => {
					callback(null, dir)
				},
				filename: (req, file, callback) => {
				  	callback(null, file.fieldname + "-" + Date.now() + "-" + module.exports.cleanSpace(file.originalname))
				}
			});
			var upload = multer({
				storage: storage,
				limits: {
					fileSize: 9 * 1024 * 1024 //9MB
				},
				fileFilter: (req, file, callback) => {
					var filetypes = /jpeg|jpg|png/;
					var extname = filetypes.test(path.extname(module.exports.cleanSpace(file.originalname)).toLowerCase());
					if(!extname){
					  	return callback(new Error("File upload only supports the following filetypes - " + filetypes));
					}
					callback(null, true);
				}
			}).single("image");
			resolve(upload);
		}catch(error){
			reject(error);
		}
	});
};

module.exports.generate_code = function(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i=0; i<length; i++){
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text.toUpperCase();
}

module.exports.isEmpty = function(value) {
	return typeof value == "string" && !value.trim() || typeof value == "undefined" || value === null;
}

module.exports.isUndefined = function(data) {
	return typeof data !== "undefined" && data !== null ? false : true;
}

module.exports.parseObjectToJSON = function(data) {
	return JSON.stringify(data);
}

module.exports.checkArray = function(data) {
	return Array.isArray(data) && data.length ? true : false;
}

module.exports.BaseResponse = function(res, status, message) {
	return res.json({status: parseInt(status), message: message.toString()});
}

module.exports.ArrayResponse = function(res, status, message, data = array()) {
	return res.json({status: parseInt(status), message: message.toString(), data: data});
}