module.exports = {
    port: process.env.PORT || 3000,
    secret: process.env.SECRET || 'supersecretkey',
    pool: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'social_network',
    }
};
