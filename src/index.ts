import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import productRrouter from './routes/productRouter'
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

app.use('/api/auth',authRouter)
app.use('/api/product',ProductRrouter)
app.use('/api/wallet',routerWallet)
app.use('/api/transaction',transactionRouter)
app.get("/", (req, res) => {
    res.send("Hello, World!");
  });




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