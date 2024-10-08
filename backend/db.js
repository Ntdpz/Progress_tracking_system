const mysql = require('mysql2');

// const dbConfig = {
//   host: 'prog.desigram-studio.com',

//   user: 'desigram_prog',
//   password: 'prog@password',
//   database: 'prog_track_db',
//   waitForConnections: true,
//   connectionLimit: 10, // จำนวน connection สูงสุดที่ pool สามารถจัดการได้
//   queueLimit: 0, // 0 หมายถึงไม่จำกัดจำนวน connection ที่รอ
// };

const dbConfig = {
  host: 'db',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'prog_track_db',
  waitForConnections: true,
  connectionLimit: 10, // จำนวน connection สูงสุดที่ pool สามารถจัดการได้
  queueLimit: 0, // 0 หมายถึงไม่จำกัดจำนวน connection ที่รอ
};

const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error getting connection from pool:", err);
    return;
  }

  connection.query('SELECT 1 + 1 AS solution', (queryErr, results) => {
    connection.release(); // คืน connection กลับไปยัง pool
    if (queryErr) {
      console.error("Error querying database:", queryErr);
      return;
    }
    console.log('The solution is: ', results[0].solution);
  });
});

module.exports = pool;
