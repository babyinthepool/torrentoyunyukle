//express
const express = require("express")
const app = express()


//rate limiter
app.set('trust proxy', 'loopback');
const rateLimit = require('express-rate-limit') 

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 300, 
	standardHeaders: 'draft-8',
	legacyHeaders: false, 

})


app.use(limiter)
// compression
const compression = require('compression');
app.use(compression());



//date format
const format = require("date-format")
const TimeAgo = require("javascript-time-ago")
const en = require("javascript-time-ago/locale/en")
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')
//database connection
const mongoose = require('mongoose')
require('dotenv').config();

const dbUrl= process.env.dbUrl
const port = process.env.port
const secret = process.env.secret
mongoose.connect(dbUrl, {
}).then(() => {
    console.log('DB baglantisi quruldu.');
}).catch(err => {
    console.error('Xeta!', err);
});

//session
const session = require("express-session")
app.use(session({
    secret:"blackHoleSun",
    resave: true,
    expires: new Date(Date.now() + (30 * 24 * 3600 * 1000)),
    saveUninitialized: true
}))

//admin state
const {adminState} = require('./middlewares.js')
app.use(adminState)

//cookieparser
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const Game = require("./models/game.js")
//view engine
const exphbs=require('express-handlebars')





    app.engine('hbs', exphbs.engine({
        extname: 'hbs',
        helpers:{
            formatText(text) {
                if (!text) return '';
                const formatted = text
                .replace(/\n/g, '<br>')
                .replace(/\t/g, '&emsp;');
                return formatted
            },
                gt: function (a, b) {
                return a > b;
    }
        }
    }));
app.set('view engine', 'hbs');
//static
const path = require('path')
app.use(express.static(path.join(__dirname, "public")));

//bodyparser
const bodyParser= require('body-parser')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//main router
const indexRouter = require("./router/indexRouter.js")
const adminRouter = require("./router/adminRouter.js")
const staticRouter = require("./router/staticRouter.js")
const gameRouter = require("./router/gameRouter.js")

app.use('/', indexRouter)
app.use('/admin', adminRouter)
app.use("/", staticRouter)
app.use("/", gameRouter)




//port connection
app.listen(port, () => {
    console.log(`sayt http://localhost:${port} seyfesinde acildi.`);
});