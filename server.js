require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const path = require('path');
const helmet = require('helmet');
const config = require('./config');

const app = express();
const pool = mysql.createPool(config.pool);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public/app')));
app.use(helmet());
app.use(morgan('dev'));

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes
const authRouter = require('./routes/authenticate')(express, pool);
app.use('/api/authenticate', authRouter);

const usersRouter = require('./routes/users')(express, pool);
app.use('/api/users', usersRouter);

const postsRouter = require('./routes/posts')(express, pool);
app.use('/api/posts', postsRouter);

const commentsRouter = require('./routes/comments')(express, pool);
app.use('/api/comments', commentsRouter);

const likesRouter = require('./routes/likes')(express, pool);
app.use('/api/likes', likesRouter);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(config.port, () => {
    console.log(`Running on port ${config.port}`);
});
