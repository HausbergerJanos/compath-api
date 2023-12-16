const express = require('express');

const app = express();

// 1) GLOBAL MIDDLEWARES

// Body parser, reading data from req.body
app.use(express.json({ limit: '10kb' }));

// 2) ROUTES

module.exports = app;
