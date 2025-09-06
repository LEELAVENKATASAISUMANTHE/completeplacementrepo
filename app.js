import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
export const app = express();
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;
//proxy setup  i am not sure about this i have to do more research on this
const allowedOrigins = [
    'http://localhost:5173', // local dev
    'https://placement-frontend-chi.vercel.app', // Vercel deployment
  ];
app.set("trust proxy", 1);
app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
     credentials: true, // Very important for sending cookies
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Or specific methods you use
    allowedHeaders: ['Content-Type', 'Authorization'] // Or specific headers you use

  }));
app.use(express.json({limit: "26kb"}));//middleware for parseing json data
app.use(express.urlencoded({ //middleware to take care of url encodeing
    extended:true,//takes care of boject in object
    limit:"16kb"//limit setting
}))
app.use(express.static("public"));
app.use(cookieParser())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static("public"));
app.use(cookieParser())

app.use(express.json());
