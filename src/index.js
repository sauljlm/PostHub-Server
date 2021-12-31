const express = require('express');
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');
const cors = require('cors');
const methodOverride = require('method-override');
const imageName = require('./helpers/utilities');
const mongoose =  require('mongoose');
require('dotenv').config();

//inicialitations
const app = express();

mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,  
    useCreateIndex: true,
    useFindAndModify: false
    }, function(err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    db = database;
    console.log("Dada base conected");

    const server = app.listen(process.env.PORT || 8000, function() {
        let port = server.address().port;
        console.log("App on port: ", port);
    });
});

//middlewares
app.use(morgan('dev'));
app.use(cors());
app.use( express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(express.urlencoded({extended: false})); //helps to understand the inputs like strings/texts from a form


const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb, filename) => {
        cb(null, imageName() + path.extname(file.originalname));
    }
});
app.use(multer({
    storage: storage
}).single('file')); //say it thet I will push only one image with the input image
app.use(methodOverride('_method')); // to allow forms submit all methods not only get and post

//static files
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use(require('./routes/users'));
app.use(require('./routes/posts'));
