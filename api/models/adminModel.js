'use strict';
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	AdminSchema = new Schema({
		name: {
			type: String,
			unique: true,
			required: "Kindly enter the name of the admin"
		},
		email: {
			type: String,
			unique: true,
			required: "E-mail is required"
		},
		password: {
			type: String,
			default: ""
		},
		salt_hash: {
			type: String,
			default: ""
		},
		reset_code: {
			type: String,
			default: ""
		},
		auth_code: {
			type: String,
			unique: true,
			required: "Authentication Code is required"
		},
		img: {
			type: String,
			default: ""
		},
		status: {
			type: Number,
			default: 0
		},
		timestamp: {
			type: Date,
			default: Date.now
		},
		datetime: {
			type: Date,
			default: Date.now
		}
	});

module.exports = mongoose.model('admins', AdminSchema);