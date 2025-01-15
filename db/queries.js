const pool = require("./pool");

async function getAllCategories() {
  const { rows } = await pool.query("SELECT category_name FROM category");
  return rows;
}

async function getAllCatalogue() {
  const { rows } = await pool.query(
    `
      SELECT name, quantity, measurment, price_rub, category_name, brand_name 
      FROM groceries 
      JOIN category ON groceries.category_id = category.id
      JOIN brand_grocery ON brand_grocery.grocery_id = groceries.id
      JOIN brand ON brand_grocery.brand_id = brand.id
      ORDER BY category_name, name;
    `
  );
  return rows;
}

async function getCatalogueBySearchQuery(queryParams) {
  const queryText = `
      SELECT groceries.id, name, quantity, measurment, price_rub, category_name, brand_name 
      FROM groceries 
      JOIN category ON groceries.category_id = category.id
      JOIN brand_grocery ON brand_grocery.grocery_id = groceries.id
      JOIN brand ON brand_grocery.brand_id = brand.id
      WHERE ${createDatabaseQueryFromRequest(queryParams)}
      ORDER BY category_name, name;
  `;
  console.log(queryText);
  const { rows } = await pool.query(queryText);

  return rows;
}

function createDatabaseQueryFromRequest(requestQueries) {
  let result = "";
  const keys = Object.keys(requestQueries); // Создаем массив ключей-столбцов по которым мы будем фильтровать значения

  keys.forEach((key) => {
    if (result != "") result += " AND "; // Проверяем был ли уже добавлен параметр запроса и добавляем AND в конец строки, если результат не пустой

    const queryValue = requestQueries[key].toLowerCase();
    if (Array.isArray(queryValue)) {
      result += `LOWER(${key}) IN (\'${queryValue.join("','")}\')`; // Обрабатываем массив запросов по одному столбцу
    } else {
      result += `LOWER(${key}) LIKE (\'${queryValue}\%')`;
    }
  });

  return result;
}

async function insertNewGrocery(grocery) {
  // Вставляем категорию, если она еще не существует

  await pool.query(
    `
      INSERT INTO category (category_name) 
      SELECT $1::VARCHAR(100) 
      WHERE NOT EXISTS (SELECT category_name FROM category WHERE category_name=$1::VARCHAR(100));
    `,
    [grocery.categoryName]
  );

  // Вставляем бренд, если он еще не существует

  await pool.query(
    `
      INSERT INTO brand (brand_name)
      SELECT $1::VARCHAR(100) 
      WHERE NOT EXISTS (SELECT brand_name FROM brand WHERE brand_name=$1::VARCHAR(100));
    `,
    [grocery.brandName]
  );

  // Вставляем товар

  await pool.query(
    `
      INSERT INTO groceries (name, quantity, measurment, price_rub, category_id) 
      SELECT 
        $1, 
        $2, 
        $3, 
        $4,
        c.id
      FROM category c
      WHERE c.category_name = $5
      RETURNING id;
    `,
    [
      grocery.name,
      grocery.quantity,
      grocery.measurment,
      grocery.priceRub,
      grocery.categoryName,
    ]
  );

  // Вставляем связь с последним товаром для бренда

  await pool.query(
    `
      INSERT INTO brand_grocery (brand_id, grocery_id) 
      SELECT 
        b.id, 
        (SELECT MAX(g.id) FROM groceries g)
      FROM brand b
      WHERE b.brand_name = $1;
    `,
    [grocery.brandName]
  );
}

// Функция обновления данных товара через форму

async function updateGrocery(updatedGroceryData) {
  // Получаем id категории товара

  const categoryData = await pool.query(
    `
      SELECT id FROM category
      WHERE LOWER(category_name) = $1;
    `,
    [updatedGroceryData.categoryName.toLowerCase()]
  );

  // Получаем не измененные ID и Имя брэнда для обновляемого товара

  const brandData = await pool.query(
    `
      SELECT brand_id, brand_name FROM brand_grocery 
      JOIN brand ON brand_grocery.brand_id = brand.id
      WHERE grocery_id = $1;
    `,
    [updatedGroceryData.groceryId]
  );

  // Получаем из результатов запроса нужные нам значения с помощью деструктуризации объектов

  const { id: categoryId } = categoryData.rows[0];
  const { brand_id: currentBrandId, brand_name: currentBrandName } =
    brandData.rows[0];

  // Обновляем таблицу groceries

  await pool.query(
    `
    UPDATE groceries
    SET name = $2,
    quantity = $3,
    measurment = $4,
    price_rub = $5,
    category_id = $6
    WHERE id = $1
    `,
    [
      updatedGroceryData.groceryId,
      updatedGroceryData.name,
      updatedGroceryData.quantity,
      updatedGroceryData.measurment,
      updatedGroceryData.priceRub,
      categoryId,
    ]
  );

  // Если принадлежность к брэнду изменилась, то тогда мы должны создать новые связи между таблицами в brand_grocery
  // и удалить старые зависимости
  // Также, следует проверить существует ли такой брэнд и при необходимости добавить новый в таблицу brand

  if (updatedGroceryData.brandName != currentBrandName) {
    // Проверяем, есть ли такой брэнд

    let newBrandId = await getBrandIdByName(updatedGroceryData.brandName);

    // Если брэнда нет в таблице, то мы должны его добавить:

    if (!newBrandId) {
      await pool.query(
        `
        INSERT INTO brand (brand_name) 
        VALUES  ($1) 
        `,
        [updatedGroceryData.brandName]
      );

      // Обновляем значение Id

      newBrandId = await getBrandIdByName(updatedGroceryData.brandName);
    }

    await deleteFromBrandGroceryTable(
      currentBrandId,
      updatedGroceryData.groceryId
    );

    await insertIntoBrandGroceryTable(newBrandId, updatedGroceryData.groceryId);
  }

  const { rows } = await pool.query(`
    SELECT * FROM groceries
    WHERE id = ${updatedGroceryData.groceryId}
    `);
  console.log(rows);

  console.log("Закончил обновление");
}

// Получаем ID брэнда по имени

async function getBrandIdByName(brandName) {
  let { rows } = await pool.query(
    `
      SELECT id FROM brand
      WHERE LOWER(brand_name) = $1;
    `,
    [brandName.toLowerCase()]
  );
  return rows.length === 0 ? false : rows[0].id; // Если объект вернулся пустым, значит такого брэнда нет и функция вернет false, иначе возвращается id
}

// Удаляет строку из таблицы brand_grocery по соответствующим ID

async function deleteFromBrandGroceryTable(brandId, groceryId) {
  await pool.query(
    `
    DELETE FROM brand_grocery
    WHERE brand_id = $1 AND grocery_id = $2;
    `,
    [brandId, groceryId]
  );
}

// Добавляет новую строку в таблицу brand_grocery по соответствующим ID

async function insertIntoBrandGroceryTable(brandId, groceryId) {
  await pool.query(
    `
    INSERT INTO brand_grocery(brand_id, grocery_id)
    VALUES($1, $2);
    `,
    [brandId, groceryId]
  );
}

/* updateGrocery({
  groceryId: 1,
  name: "Молоко",
  quantity: 4,
  measurment: "л",
  priceRub: 93,
  categoryName: "Молочная продукция",
  brandName: "Луг-Раздолье",
}); */

module.exports = {
  getAllCategories,
  getAllCatalogue,
  getCatalogueBySearchQuery,
  insertNewGrocery,
  updateGrocery,
};
