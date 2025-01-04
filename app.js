const pool = require("./db/pool");

async function getAllGroceries() {
  const { rows } = await pool.query("SELECT * FROM groceries");
  console.log(rows);
}

getAllGroceries();
