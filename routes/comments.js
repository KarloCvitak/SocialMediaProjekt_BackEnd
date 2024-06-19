const verifyToken = require('../middlewares/verifyToken');

/*
* const commentsRouter = require('./routes/comments')(express, pool);
app.use('/api/comments', commentsRouter);
* */

module.exports = (express, pool) => {
    const commentsRouter = express.Router();

    commentsRouter.use(verifyToken);

    commentsRouter.route('/')
        .get(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM comments');
                conn.release();
                res.json({ status: 'OK', comments: rows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .post(async (req, res) => {
            const comment = {
                user_id: req.body.user_id,
                post_id: req.body.post_id,
                content: req.body.content
            };

            try {
                const conn = await pool.getConnection();
                const result = await conn.query('INSERT INTO comments SET ?', comment);
                conn.release();
                res.json({ status: 'OK', insertId: result.insertId });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });


    commentsRouter.route('/posts/:postId')

        .get(async (req, res) => {
            const postId = parseInt(req.params.postId, 10);
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM comments WHERE post_id = ?', [postId]);
                conn.release();
                res.json({ status: 'OK', comment: rows[0] });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        }).put(async (req, res) => {
        const comment = req.body;
        try {
            const conn = await pool.getConnection();
            const result = await conn.query('UPDATE comments SET ? WHERE id = ?', [comment, req.params.id]);
            conn.release();
            res.json({ status: 'OK', changedRows: result.changedRows });
        } catch (e) {
            console.error(e);
            res.status(500).json({ status: 'Error', message: e.message });
        }
    })


    commentsRouter.route('/:id')
        .get(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
                conn.release();
                res.json({ status: 'OK', comment: rows[0] });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        })
        .put(async (req, res) => {
            const comment = req.body;
            try {
                const conn = await pool.getConnection();
                const result = await conn.query('UPDATE comments SET ? WHERE id = ?', [comment, req.params.id]);
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
                const result = await conn.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
                conn.release();
                res.json({ status: 'OK', affectedRows: result.affectedRows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });


    commentsRouter.route('/posts/:postId')
        .delete(async (req, res) => {
            try {
                const conn = await pool.getConnection();
                const result = await conn.query('DELETE FROM comments WHERE post_id = ?', [req.params.postId]);
                conn.release();
                res.json({ status: 'OK', affectedRows: result.affectedRows });
            } catch (e) {
                console.error(e);
                res.status(500).json({ status: 'Error', message: e.message });
            }
        });

    return commentsRouter;
};
