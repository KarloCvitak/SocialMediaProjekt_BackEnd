const verifyToken = require('../middlewares/verifyToken');

module.exports = (express, pool) => {
    const postsRouter = express.Router();

    postsRouter.use(verifyToken);

    postsRouter.route('/')
        .get(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM posts');
                conn.release();
                res.json({ status: 'OK', posts: rows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .post(async (req, res) => {
            const post = {
                user_id: req.decoded.id,
                content: req.body.content,
                gif_url: req.body.gif_url
            };

            try {
                const conn = await pool.getConnection();
                const result = await conn.query('INSERT INTO posts SET ?', post);
                conn.release();
                res.json({ status: 'OK', insertId: result.insertId });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });

    postsRouter.route('/users/:userId')
        .get(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM posts WHERE user_id = ?', [req.params.userId]);
                conn.release();
                res.json({ status: 'OK', post: rows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })

    postsRouter.route('/:id')
        .get(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
                conn.release();
                res.json({ status: 'OK', post: rows[0] });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .put(async (req, res) => {
            const postId = parseInt(req.params.id, 10);
            const { content } = req.body;
            try {
                const conn = await pool.getConnection();
                const result = await conn.query('UPDATE posts SET content = ? WHERE id = ?', [content, postId]);
                conn.release();
                res.json({ status: 'OK', changedRows: result.changedRows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .delete(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const result = await conn.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
                conn.release();
                res.json({ status: 'OK', affectedRows: result.affectedRows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });

    return postsRouter;
};
