var Movie = require('../models/movie');
var Category = require('../models/category');
var Comment = require('../models/comment');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

exports.detail = function(req, res){
    var id = req.params.id;
    Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
        if (err) {
            console.log(err);
        }
    });
    Movie.findById(id, function(err, movie){
        Comment.find({movie: id})
            .populate('from', 'name')
            .populate('reply.from reply.to', 'name')
            .exec(function(err, comments) {
                res.render('detail', {
                    title: '电影 ' + movie.title,
                    movie: movie,
                    comments: comments
                });
            });
    });
};

exports.new =  function(req, res){
    Category.fetch(function(err, categories) {
        res.render('admin', {
            title: 'Movie Admin',
            movie: {},
            categories: categories
        });
    });

};

exports.update = function(req, res){
    var id = req.params.id;
    if(id) {
        Movie.findById(id, function(err, movie){
            Category.find({}, function(err, categories) {
                res.render('admin', {
                    title: 'Movie Update',
                    movie: movie,
                    categories: categories
                });
            });
        });
    }
};

exports.savePoster = function(req, res, next) {
    var posterData = req.files.uploadPoster;
    var filePath = posterData.path;
    var originalFileName = posterData.originalFilename;
    if (originalFileName) {
        fs.readFile(filePath, function(err, data) {
            var timestamp = Date.now();
            var type = posterData.type.split('/')[1];
            var poster = timestamp + '.' + type;
            var newPath = path.join(__dirname, '../../', '/public/upload/' + poster);
            fs.writeFile(newPath, data, function(err) {
                req.poster = poster;
                next();
            });
        });
    } else {
        next();
    }
};

exports.save = function(req, res){
    var movieObj = req.body.movie;
    var id = req.body.movie._id;
    var _movie;

    if (req.poster) {
        movieObj.poster = req.poster;
    }
    if (id) {
        Movie.findById(id, function(err, movie){
            if(err) {
                console.log(err);
            }
            _movie = _.extend(movie, movieObj);
            _movie.save(function(err, movie){
                if(err) {
                    console.log(err);
                }
                res.redirect('/movie/' + movie._id);
            });
        });
    } else {
        _movie = new Movie(movieObj);
        var categoryId = movieObj.category;
        var categoryName = movieObj.categoryName;
        _movie.save(function(err, movie){
            if (err) {
                console.log(err);
            }
            if (categoryId) {
                Category.findById(categoryId, function(err, category) {
                    category.movies.push(movie._id);
                    category.save(function(err) {
                        res.redirect('/movie/' + movie._id);
                    });
                });
            } else if (categoryName) {
                var category = new Category({
                    name: categoryName,
                    movies: [movie._id]
                });
                category.save(function(err, category) {
                    movie.category = category._id;
                    movie.save(function(err, movie) {
                        res.redirect('/movie/' + movie._id);
                    });
                });
            }
        });
    }
};

exports.list = function(req, res){
    Movie.fetch(function(err, movies){
        if (err) {
            console.log(err);
        }
        res.render('list', {
            title: 'Movie List',
            movies: movies
        });
    });
};

exports.del = function(req, res){
    var id = req.query.id;
    if (id) {
        Movie.remove({_id: id}, function(err, movie) {
            if (err) {
                console.log(err);
            } else {
                res.json({success: 1});
            }
        });
    }
};