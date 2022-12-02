const express = require('express');
const http = require('http');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const programeRoutes = require('./routes/programeRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const quizRoutes = require('./routes/quizRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const socialAuthRoutes = require('./routes/socialAuthRoutes');

const passport = require('passport');
const session = require('express-session');

const app = express();
const server = http.createServer(app);

app.use(cookieParser());

app.use(cors());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(express.static(`${__dirname}/public`));
app.set('view engine', 'ejs');

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET',
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/auth', socialAuthRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/chapter', chapterRoutes);
app.use('/api/v1/program', programeRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = { server };
