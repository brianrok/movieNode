var Movie = require('../models/movie');
var Category = require('../models/category');

// index page
exports.index = function(req, res){
	Category.find({})
		.populate({path: 'movies', options: {limit: 5}})
		.exec(function(err, categories) {
			if (err) {
				console.log(err);
			}
			res.render('index', {
				title: '首页',
				categories: categories
			});
		});
};

exports.search = function(req, res){
	var catId = req.query.cat;
	var page = parseInt(req.query.p, 10) || 0;
	var q = req.query.q;
	var count = 2;
	var index = page * count;
	if (catId) {
		Category.find({_id: catId})
			.populate({path: 'movies', select: 'title poster'})
			.exec(function(err, categories) {
				if (err) {
					console.log(err);
				}
				var category = categories[0] || {};
				var movies = category.movies || [];
				var results = movies.slice(index, index + count);
				res.render('result', {
					title: '结果',
					keyword: category.name,
					currentPage: page + 1,
					totalPages: Math.ceil(movies.length / count),
					movies: results,
					query: 'cat=' + category._id
				});
			});
	} else {
		Movie.find({title: new RegExp(q + '.*')}).exec(function(err, movies) {
			movies = movies || [];
			var results = movies.slice(index, index + count);
			res.render('result', {
				title: '结果',
				keyword: q,
				currentPage: page + 1,
				totalPages: Math.ceil(movies.length / count),
				movies: results,
				query: 'q=' + q
			});
		});
	}

};