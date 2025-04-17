import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import Redis from 'ioredis';
import session from "express-session";
import IORedis from "ioredis";
import { RedisStore } from "connect-redis";
import redisClient from "./utils/redisClient";

import productRrouter from './routes/productRouter'
import cartRouter from './routes/cartRouter'

import ProductRrouter from './routes/productRouterDuplicate'
import authRouter from './routes/authRouter'
import routerWallet from './routes/walletRoute'
import transactionRouter from './routes/transctionRoutes'
import ngrok from 'ngrok';

dotenv.config()
const app = express();

app.use(cors({
    credentials : true
}))

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({extended:true}));


const redis = new Redis();


app.use('/api/auth',authRouter)
app.use('/api/product',ProductRrouter)
app.use('/api/wallet',routerWallet)
app.use('/api/transaction',transactionRouter)
app.use('/api/cart',cartRouter)

app.get("/", (req, res) => {
    res.send("Hello, World!");
  });


app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "session:", // Optional prefix for session keys
    }),
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);



app.listen(8080, async()=> {
    console.log("Now running on port 8080")

    try {
        const url = await ngrok.connect({
          addr: 8080, // Expose your Express app
          authtoken: process.env.NGROK_AUTH_TOKEN, // Your Ngrok auth token (optional)
        });
    
        console.log(`🌍 Ngrok Tunnel: ${url}`);
      } catch (error) {
        console.error("❌ Error starting Ngrok:", error);
      }
})

 
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Database connected")
}).catch(err => {
    console.log(err)
})