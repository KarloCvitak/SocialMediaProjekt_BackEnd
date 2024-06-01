const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'social_network'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
    }
});

// Middleware for checking token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, 'SECRET_KEY', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


////////////////////////////////////////
////////////// USER ///////////////////
///////////////////////////////////////


// User registration

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    db.execute(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            res.status(500).send('Error registering user');
        } else {
            res.status(201).send('User registered');
        }
    });
});

// User login

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.execute(query, [email], (err, results) => {
        if (err || results.length === 0) {
            res.status(400).send('User not found');
        } else {
            const user = results[0];
            if (bcrypt.compareSync(password, user.password_hash)) {
                const token = jwt.sign({ id: user.id, username: user.username }, 'SECRET_KEY');
                res.json({ token });
            } else {
                res.status(400).send('Incorrect password');
            }
        }
    });
});

// Get user profile

app.get('/users/:id', authenticateToken, (req, res) => {
    const query = 'SELECT id, username, email, bio, profile_picture FROM users WHERE id = ?';
    db.execute(query, [req.params.id], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).send('User not found');
        } else {
            res.json(results[0]);
        }
    });
});

// Update user profile

app.put('/users/:id', authenticateToken, (req, res) => {
    const { bio, profile_picture } = req.body;
    const query = 'UPDATE users SET bio = ?, profile_picture = ? WHERE id = ?';
    db.execute(query, [bio, profile_picture, req.params.id], (err, result) => {
        if (err) {
            res.status(500).send('Error updating profile');
        } else {
            res.send('Profile updated');
        }
    });
});


////////////////////////////////////////
////////////// POSTS //////////////////
///////////////////////////////////////


// Get all posts

app.get('/posts', (req, res) => {
    const query = 'SELECT * FROM posts';
    db.execute(query, (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving posts');
        } else {
            res.json(results);
        }
    });
});

// Create new post

app.post('/posts', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const query = 'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)';
    db.execute(query, [req.user.id, title, content], (err, result) => {
        if (err) {
            res.status(500).send('Error creating post');
        } else {
            res.status(201).send('Post created');
        }
    });
});

// Get single post

app.get('/posts/:id', (req, res) => {
    const query = 'SELECT * FROM posts WHERE id = ?';
    db.execute(query, [req.params.id], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).send('Post not found');
        } else {
            res.json(results[0]);
        }
    });
});

// Update post

app.put('/posts/:id', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?';
    db.execute(query, [title, content, req.params.id, req.user.id], (err, result) => {
        if (err || result.affectedRows === 0) {
            res.status(404).send('Post not found or not authorized');
        } else {
            res.send('Post updated');
        }
    });
});

// Delete post

app.delete('/posts/:id', authenticateToken, (req, res) => {
    const query = 'DELETE FROM posts WHERE id = ? AND user_id = ?';
    db.execute(query, [req.params.id, req.user.id], (err, result) => {
        if (err || result.affectedRows === 0) {
            res.status(404).send('Post not found or not authorized');
        } else {
            res.send('Post deleted');
        }
    });
});



////////////////////////////////////////
////////////// COMMENTS ////////////////
///////////////////////////////////////


// Get comments for post
app.get('/posts/:id/comments', (req, res) => {
    const query = 'SELECT * FROM comments WHERE post_id = ?';
    db.execute(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving comments');
        } else {
            res.json(results);
        }
    });
});

// Create new comment
app.post('/comments', authenticateToken, (req, res) => {
    const { post_id, content } = req.body;
    const query = 'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)';
    db.execute(query, [post_id, req.user.id, content], (err, result) => {
        if (err) {
            res.status(500).send('Error creating comment');
        } else {
            res.status(201).send('Comment created');
        }
    });
});

// Update comment
app.put('/comments/:id', authenticateToken, (req, res) => {
    const { content } = req.body;
    const query = 'UPDATE comments SET content = ? WHERE id = ? AND user_id = ?';
    db.execute(query, [content, req.params.id, req.user.id], (err, result) => {
        if (err || result.affectedRows === 0) {
            res.status(404).send('Comment not found or not authorized');
        } else {
            res.send('Comment updated');
        }
    });
});

// Delete comment
app.delete('/comments/:id', authenticateToken, (req, res) => {
    const query = 'DELETE FROM comments WHERE id = ? AND user_id = ?';
    db.execute(query, [req.params.id, req.user.id], (err, result) => {
        if (err || result.affectedRows === 0) {
            res.status(404).send('Comment not found or not authorized');
        } else {
            res.send('Comment deleted');
        }
    });
});


////////////////////////////////////////
////////////// LIKES //////////////////
///////////////////////////////////////

// Get likes for post
app.get('/posts/:id/likes', (req, res) => {
    const query = 'SELECT * FROM likes WHERE post_id = ?';
    db.execute(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving likes');
        } else {
            res.json(results);
        }
    });
});

// Add like
app.post('/likes', authenticateToken, (req, res) => {
    const { post_id } = req.body;
    const query = 'INSERT INTO likes (post_id, user_id) VALUES (?, ?)';
    db.execute(query, [post_id, req.user.id], (err, result) => {
        if (err) {
            res.status(500).send('Error adding like');
        } else {
            res.status(201).send('Like added');
        }
    });
});

// Remove like
app.delete('/likes/:id', authenticateToken, (req, res) => {
    const query = 'DELETE FROM likes WHERE id = ? AND user_id = ?';
    db.execute(query, [req.params.id, req.user.id], (err, result) => {
        if (err || result.affectedRows === 0) {
            res.status(404).send('Like not found or not authorized');
        } else {
            res.send('Like removed');
        }
    });
});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
