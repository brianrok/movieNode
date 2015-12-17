var crypto = require('crypto');
var len = 50;
console.log(Math.ceil(len / 2).toString(16));
var a = crypto.randomBytes(Math.ceil(len / 2).toString(16));
console.log(a);