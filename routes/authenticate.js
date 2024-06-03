const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (express, pool) => {
    const authRouter = express.Router();

    // Registration endpoint
    authRouter.post('/register', async (req, res) => {
        const passwordHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
        const user = {
            username: req.body.username,
            password_hash: passwordHash,
            email: req.body.email,
            role: 'user'
        };

        try {
            const conn = await pool.getConnection();
            const [result] = await conn.query('INSERT INTO users SET ?', user);
            conn.release();
            res.json({ status: 'OK', insertId: result.insertId });
        } catch (e) {
            console.error('Error during registration:', e);
            res.status(500).json({ status: 'Error', message: e.message });
        }
    });

    authRouter.post('/check-username-email', async (req, res) => {
        const { username, email } = req.body;

        try {
            const [usernameResult] = await pool.query('SELECT COUNT(*) as count FROM users WHERE username = ?', [username]);
            const [emailResult] = await pool.query('SELECT COUNT(*) as count FROM users WHERE email = ?', [email]);

            const usernameInUse = usernameResult[0].count > 0;
            const emailInUse = emailResult[0].count > 0;

            res.json({
                usernameInUse: usernameInUse,
                emailInUse: emailInUse
            });
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


    // Login endpoint
    authRouter.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        try {
            const conn = await pool.getConnection();
            const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
            conn.release();

            console.log('User fetched from database:', rows);
            console.log('Stored hash:', rows.length ? rows[0].password_hash : 'No user found');
            console.log('Provided hash:', passwordHash);

            if (rows.length && rows[0].password_hash === passwordHash) {
                const token = jwt.sign({ id: rows[0].id, email: rows[0].email, role: rows[0].role }, config.secret, { expiresIn: '24h' });
                res.json({ status: 'OK', token });
                console.log('Received token:', token);

            } else {
                res.status(401).json({ status: 'Error', message: 'Invalid credentials' });
            }
        } catch (e) {
            console.error('Error during login:', e);
            res.status(500).json({ status: 'Error', message: e.message });
        }
    });

    return authRouter;
};
