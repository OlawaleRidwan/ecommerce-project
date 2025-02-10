import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import router from './routes/authRouter'

dotenv.config()
const app = express();

app.use(cors({
    credentials : true
}))

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())

app.use('/api/auth',router)

app.listen(8080, ()=> {
    console.log("Now running on port 8080")
})

 
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Database connected")
}).catch(err => {
    console.log(err)
})