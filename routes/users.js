const crypto = require('crypto');
const verifyToken = require('../middlewares/verifyToken');

module.exports = (express, pool) => {
    const usersRouter = express.Router();

    usersRouter.use(verifyToken);

    usersRouter.route('/')
        .get(async (req, res) => {
            try {
                const [rows] = await pool.query('SELECT * FROM users');
                res.json({ status: 'OK', users: rows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .post(async (req, res) => {
            const user = {
                username: req.body.username,
                password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
                email: req.body.email
            };

            try {
                const [result] = await pool.query('INSERT INTO users SET ?', user);
                res.json({ status: 'OK', insertId: result.insertId });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });

    usersRouter.route('/:id')
        .get(async (req, res) => {
            try {
                const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
                res.json({ status: 'OK', user: rows[0] });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .put(async (req, res) => {
            const user = req.body;
            try {
                const [result] = await pool.query('UPDATE users SET ? WHERE id = ?', [user, req.params.id]);
                res.json({ status: 'OK', changedRows: result.changedRows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .delete(async (req, res) => {
            try {
                const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
                res.json({ status: 'OK', affectedRows: result.affectedRows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });

    return usersRouter;
};
