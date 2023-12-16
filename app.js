const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const projectRouter = require('./routes/projectRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES

// Body parser, reading data from req.body
app.use(express.json({ limit: '10kb' }));

// 2) ROUTES
app.use('/api/v1/projects', projectRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
