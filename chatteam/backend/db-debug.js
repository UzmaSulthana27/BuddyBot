// db-debug.js
const pool = require('./config/database'); // adjust path if needed

(async () => {
  try {
    const [dbSel] = await pool.query('SELECT DATABASE() AS db');
    console.log('Connected database:', dbSel[0].db);

    const [tables] = await pool.query("SHOW TABLES");
    console.log('Tables count:', tables.length);
    console.log('Tables:', tables);

    const [ver] = await pool.query('SELECT VERSION() as v');
    console.log('MySQL version:', ver[0].v);

    // Quick insert test table (safe)
    await pool.query(`CREATE TABLE IF NOT EXISTS debug_test (
      id INT AUTO_INCREMENT PRIMARY KEY,
      msg VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`);

    const [ins] = await pool.query("INSERT INTO debug_test (msg) VALUES (?)", ['hello from debug']);
    console.log('Inserted debug id:', ins.insertId);

    const [rows] = await pool.query("SELECT * FROM debug_test ORDER BY id DESC LIMIT 5");
    console.log('Last debug rows:', rows);

    process.exit(0);
  } catch (err) {
    console.error('db-debug error:', err);
    process.exit(1);
  }
})();
