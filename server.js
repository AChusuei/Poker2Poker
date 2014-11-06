var express    = require('express'); 		
var app        = express(); 				
var port       = process.env.PORT || 8000; 		

// routes ==================================================
require('./app/routes.js')(app); // pass our application into our routes

// static page routes
app.use(express.static(__dirname + '/public'));
app.listen(port); 
console.log('poker2poker started on port ' + port);