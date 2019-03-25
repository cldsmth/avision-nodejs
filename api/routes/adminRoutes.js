'use strict';
module.exports = function(app) {
	var admin = require('../controllers/adminController');

	app.route('/admin')
		.post(admin.insert_data);

	app.route('/admin/:id')
		.get(admin.get_detail)
		.put(admin.update_data)
		.delete(admin.delete_data);

	app.route('/admin/login')
		.post(admin.login);

	app.route('/admin/change-password')
		.post(admin.change_password);

	app.route('/admin/page/:page')
		.get(admin.get_all);

	app.route('/admin/upload')
		.post(admin.upload);
}