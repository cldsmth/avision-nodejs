'use strict';
var functions = require('../../helpers/functions'),
	PasswordHash = require('../../class/PasswordHash'), passwordHash = new PasswordHash(),
	mongoose = require('mongoose'), Admin = mongoose.model('admins'),
	multer = require('multer'), sharp = require('sharp'),
	path = require('path'), fs = require('fs');

exports.upload = function(req, res) {
	try{
		functions.save_image(multer, path, __dir_admin).then(resolve => {
			resolve(req, res, function(err) {
				if(!err){
					if(!functions.isUndefined(req.file)){
						var id = req.body.id;
						getImage(id).then(resolve => {
							var old_image = resolve;
							var filename = req.file.filename;
							var src = req.file.path;
							var dest = req.file.destination + "thmb/" + filename;
							setImage(id, filename).then(resolve => {
								if(!functions.isUndefined(resolve)){
									if(!functions.isEmpty(old_image)){
										functions.remove_file(fs, __dir_admin + old_image);
										functions.remove_file(fs, __dir_admin + "thmb/" +old_image);
									}
									fs.copyFile(src, dest, (err) => {
										if(!err){
											sharp(dest).toBuffer().then(data => {
												sharp(data).resize(200, 200).toFile(dest, (error, info) => {
													console.log(info);
												})
											}).catch(error => {
												console.log(error);
											});
									  	}else{
									  		console.log(err);	
									  	}
									});
									functions.ArrayResponse(res, 200, "Success", resolve);
								}else{
									functions.remove_file(fs, src);
									functions.BaseResponse(res, 400, "Failed");
								}
							}).catch(reject => {
								functions.remove_file(fs, src);
								functions.BaseResponse(res, 400, reject);
							});
						}).catch(reject => {
							functions.BaseResponse(res, 400, reject);
						});
					}else{
						functions.BaseResponse(res, 400, "Failed");
					}
				}else{
					functions.BaseResponse(res, 400, err);
				}
			});
		}).catch(reject => {
			functions.BaseResponse(res, 400, reject);
		});
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

exports.login = function(req, res) {
	try{
		var query, projection,
			body = req.body,
			email = body.email,
			password = body.password;
		getSalthHash(email).then(resolve => {
			query = {
				email: email,
				password: passwordHash.getHashPassword(password, resolve)
			};
			projection = {
				name: true,
				email: true,
				img: true,
				auth_code: true,
				status: true
			};
			Admin.findOne(query, projection, function(err, data) {
				if(!err){
					if(!functions.isUndefined(data)){
						if(data.status == 1){
							functions.ArrayResponse(res, 200, "Success", data);	
						}else{
							functions.BaseResponse(res, 401, "Your account has been inactive");
						}
					}else{
						functions.BaseResponse(res, 400, "Failed");
					}
				}else{
					functions.ArrayResponse(res, 400, "Error", err);
				}
			});
		}).catch(reject => {
			functions.BaseResponse(res, 400, reject);
		});
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

exports.change_password = function(req, res) {
	try{
		var passwords, query, field, projection,
			body = req.body, id = body.id,
			new_password = body.new_password,
			confirm_password = body.confirm_password;
		if(new_password == confirm_password){
			passwords = passwordHash.saltHashPassword(new_password);
			query = {
				_id: id
			};
			field = {
				salt_hash: passwords.salt,
				password: passwords.password,
				timestamp: Date.now()
			};
			projection = {
				salt_hash: 1,
				password: 1,
				status: 1
			};
			Admin.findOneAndUpdate(query, {$set: field}, {fields: projection, new: true}, function(err, data) {
				if(!err){
					if(!functions.isUndefined(data)){
						functions.BaseResponse(res, 200, "Success");
					}else{
						functions.BaseResponse(res, 400, "Failed");
					}
				}else{
					functions.ArrayResponse(res, 400, "Error", err);
				}
			});
		}else{
			functions.BaseResponse(res, 401, "Confirm password does not match");
		}
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

exports.get_all = function(req, res) {
	try{
		var size = 20,
			page = req.params.page,
			query = {},
			projection = {
				name: true,
				email: true,
				img: true,
				status: true,
				timestamp: true,
				datetime: true
			},
			options = {
				skip: size * (page - 1),
	    		limit: size
			};
		if(Number(page)){
			Admin.count(query, function(err_count, tot_count) {
		    	if(!err_count){
					Admin.find(query, projection, options).sort({datetime: -1}).exec(function(err, data) {
						if(!err){
							if(functions.checkArray(data)){
								var datas = {
									total_page: Math.ceil(tot_count / size),
									total_data: data.length,
									total_data_all: tot_count,
									remaining: tot_count - (((page-1) * size) + data.length),
									data: data
								};
								functions.ArrayResponse(res, 200, "Data Exist", datas);
							}else{
								functions.BaseResponse(res, 400, "No Data");
							}
						}else{
							functions.ArrayResponse(res, 400, "Error", err);
						}
					});
				}else{
					functions.ArrayResponse(res, 400, "Error", err_count);
				}
		    });
		}else{
			functions.BaseResponse(res, 401, "Invalid page number, should start with 1");
		}
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

exports.get_detail = function(req, res) {
	try{
		Admin.findById(req.params.id, function(err, data) {
			if(!err){
				if(!functions.isUndefined(data)){
					functions.ArrayResponse(res, 200, "Data Exist", data);
				}else{
					functions.BaseResponse(res, 400, "No Data");
				}
			}else{
				functions.ArrayResponse(res, 400, "Error", err);
			}
		});
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

exports.insert_data = function(req, res) {
	try{
		var param, passwords, 
			body = req.body, code = functions.generate_code(32);
		body.auth_code = code;
		if(!functions.isEmpty(body.password)){
			passwords = passwordHash.saltHashPassword(body.password);
			body.password = passwords.password;
			body.salt_hash = passwords.salt;
		}else{
			body.password = "";
			body.salt_hash = "";
		}
	 	param = new Admin(body);
		param.save(function(err, data) {
			if(!err){
				if(!functions.isUndefined(data)){
					functions.ArrayResponse(res, 200, "Success", data);
				}else{
					functions.BaseResponse(res, 400, "Failed");
				}
			}else{
				functions.ArrayResponse(res, 400, "Error", err);
			}
		});
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

exports.update_data = function(req, res) {
	try{
		var id = req.params.id,
			body = req.body,
			projection = {
				name: 1,
				email: 1,
				img: 1,
				status: 1,
				timestamp: 1,
				datetime: 1
			};
		body.timestamp = Date.now();
		Admin.findOneAndUpdate({_id: id}, body, {fields: projection, new: true}, function(err, data) {
			if(!err){
				if(!functions.isUndefined(data)){
					functions.ArrayResponse(res, 200, "Success", data);
				}else{
					functions.BaseResponse(res, 400, "Failed");
				}
			}else{
				functions.ArrayResponse(res, 400, "Error", err);
			}
		});
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

exports.delete_data = function(req, res) {
	try{
		var id = req.params.id;
		getImage(id).then(resolve => {
			Admin.deleteOne({_id: id}, function(err, data) {
				if(!err){
					if(data.n >= 1){
						if(!functions.isEmpty(resolve)){
							functions.remove_file(fs, __dir_admin + resolve);
							functions.remove_file(fs, __dir_admin + "thmb/" +resolve);
						}
						functions.BaseResponse(res, 200, "Success");
					}else{
						functions.BaseResponse(res, 400, "Failed");
					}
				}else{
					functions.ArrayResponse(res, 400, "Error", err);
				}
			});
		}).catch(reject => {
			functions.BaseResponse(res, 400, reject);
		});
	}catch(error){
		functions.BaseResponse(res, 400, error);
	}
};

function getSalthHash(email) {
	return new Promise(function(resolve, reject) {
		try{
			var value;
			Admin.findOne({email: email}, {salt_hash: true}, function(err, data) {
				if(!err){
					if(!functions.isUndefined(data)){
						value = data.salt_hash;
					}else{
						value = "";
					}
				}else{
					value = "";
				}
				resolve(value);
			});
		}catch(error){
			reject(error);
		}
	});
};

function getImage(id) {
	return new Promise(function(resolve, reject) {
		try{
			var value;
			Admin.findOne({_id: id}, {img: true}, function(err, data) {
				if(!err){
					if(!functions.isUndefined(data)){
						value = data.img;
					}else{
						value = "";
					}
				}else{
					value = "";
				}
				resolve(value);
			});
		}catch(error){
			reject(error);
		}
	});
};

function setImage(id, filename) {
	return new Promise(function(resolve, reject) {
		try{
			var query = {
					_id: id
				},
		  		field = {
					img: filename,
					timestamp: Date.now()
				},
				projection = {
					img: 1
				};
			Admin.findOneAndUpdate(query, {$set: field}, {fields: projection, new: true}, function(err, data) {
				if(!err){
					resolve(data);
				}else{
					reject(err);
				}
			});
		}catch(error){
			reject(error);
		}
	});
};