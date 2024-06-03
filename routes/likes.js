const verifyToken = require('../middlewares/verifyToken');

module.exports = (express, pool) => {
    const likesRouter = express.Router();

    likesRouter.use(verifyToken);

    likesRouter.route('/')
        .get(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM likes');
                conn.release();
                res.json({ status: 'OK', likes: rows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .post(async (req, res) => {
            const like = {
                user_id: req.decoded.id,
                post_id: req.body.post_id
            };

            try {
                const conn = await pool.getConnection();
                const result = await conn.query('INSERT INTO likes SET ?', like);
                conn.release();
                res.json({ status: 'OK', insertId: result.insertId });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });

    likesRouter.route('/:id')
        .get(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM likes WHERE id = ?', [req.params.id]);
                conn.release();
                res.json({ status: 'OK', like: rows[0] });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .delete(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const result = await conn.query('DELETE FROM likes WHERE id = ?', [req.params.id]);
                conn.release();
                res.json({ status: 'OK', affectedRows: result.affectedRows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });

    return likesRouter;
};
