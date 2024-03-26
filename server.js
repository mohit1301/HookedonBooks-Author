require('dotenv').config()
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const PORT = process.env.AUTHOR_PORT || 3001
require('./dbConfig/config')
const getNewAccessToken = require('./middleware/getNewAccessToken')

const cors = require('cors')

app.use(cors({
    origin: `${process.env.AUTH_URL}`,
    credentials: true, 
}))

app.use(cookieParser())
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', 'views')
app.set('layout', 'layouts/layout')
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.urlencoded({ limit: '10mb', extended: false }))

const authorRouter = require('./routes/authorRoutes')
const authenticate = require('./middleware/authMiddleware')

app.use(authenticate)
app.use((req, res, next) => {
    // if (req.errorMessage === 'JsonWebTokenError') {
    //     console.log('access token inisde 2nd middleware: ', req.accessToken)
    //     console.log('refresh token inisde 2nd middleware: ', req.refreshToken)
    //     res.redirect(`${process.env.AUTH_BASEURL}/auth/login`)
    // }
    // else 
    if (req.errorMessage === 'TokenExpired') {
        // Apply getNewAccessToken middleware only when req.errorMessage is present
        getNewAccessToken(req, res, next);
    } 
    else {
        // Skip getNewAccessToken middleware
        next();
    }
});

app.use('/authors', authorRouter)

app.listen(PORT, ()=>{
    console.log(`Author service is running on port ${PORT}`)
})