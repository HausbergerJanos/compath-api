const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const projectRouter = require('./routes/projectRoutes');
const deeplinkRouter = require('./routes/deeplinkRoutes');
const redirectRouter = require('./routes/redirectRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP records
app.use(helmet());

app.use(cors({ origin: 'https://foo.bar' }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//app.use(cors({ origin: 'http://127.0.0.1:5500' }));

// Limit requests from same IP
app.set('trust proxy', 1);
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, please try it again one hour later!',
});
app.use('/api', limiter);

// Body parser, reading data from req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xssClean());

// Prevent parameter pollution - TODO
app.use(
  hpp({
    whitelist: [
      //'duration',
      //'ratingsQuantity',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

// 2) ROUTES
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/deeplinks', deeplinkRouter);
app.use('/api/v1/redirects', redirectRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
