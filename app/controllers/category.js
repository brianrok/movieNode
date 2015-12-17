var Category = require('../models/category');

exports.new = function(req, res) {
	res.render('category_admin', {
		title: '分类录入',
		category: {}
	});
};

exports.save = function(req, res) {
	var _category = req.body.category;
	var category = new Category(_category);
	category.save(function(err) {
		res.redirect('/admin/category/list');
	});
};

exports.list = function(req, res) {
	Category.fetch(function(err, categories) {
		res.render('category_list', {
			title: '分类列表',
			categories: categories
		});
	});
};