const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { sql } = require("@vercel/postgres");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

app.delete("/to-do/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = await sql`
      DELETE FROM to_do
      WHERE id = ${id}
      RETURNING *;
    `;

    if (query.rowCount === 0) {
      return res.status(404).send({ message: "To Do não encontrado" });
    }

    res.status(200).json({ id: query.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao deletar To Do" });
  }
});

app.put("/to-do/:id", async (req, res) => {
  const { id } = req.params;
  const { description, title, isimportant, isdone } = req.body;

  try {
    const query = await sql`
      UPDATE to_do
      SET title = ${title}, description = ${description}, isimportant = ${isimportant}, isdone = ${isdone}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (query.rowCount === 0) {
      return res.status(404).send({ message: "To Do não encontrado" });
    }
    res.status(200).json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao atualizar To Do" });
  }
});

app.post("/to-do", async (req, res) => {
  const { categoryid, description, title } = req.body;

  if (
    typeof description !== "string" ||
    typeof title !== "string" ||
    typeof categoryid !== "number"
  ) {
    res.status(400).send("Dados inválidos fornecidos");
    return;
  }

  try {
    const query = await sql`
        INSERT INTO to_do (categoryid, title, description)
        VALUES (${categoryid}, ${title}, ${description})
        RETURNING *;
    `;

    res.status(201).json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao criar To Do");
  }
});

app.delete("/category/:id", async (req, res) => {
  const { id } = req.params;

  const query = await sql`
    DELETE FROM category
    WHERE id = ${id}
    RETURNING *;
  `;

  if (query.rowCount === 0) {
    return res.status(404).send({ message: "Categoria não encontrada" });
  }

  res.status(200).json({ id });
});

app.put("/category/:id", async (req, res) => {
  const { id } = req.params;
  const { iconname, isfavorite, title } = req.body;

  if (!id) {
    return res
      .status(400)
      .send("É necessário fornecer o ID da categoria para atualização.");
  }

  const queryCategory = await sql`
    UPDATE category
    SET title = ${title}, iconname = ${iconname}, isfavorite = ${isfavorite}
    WHERE id = ${id}
    RETURNING *;
  `;

  if (queryCategory.rowCount === 0) {
    return res.status(404).send("Categoria não encontrada");
  }

  const queryToDo = await sql`
    SELECT * FROM to_do WHERE categoryId = ${id};
  `;

  res.status(200).json({ ...queryCategory.rows[0], todoitems: queryToDo.rows });
});

app.post("/category", async (req, res) => {
  const { iconname, title } = req.body;
  const isfavorite = false;
  const todoitems = [];

  try {
    if (typeof iconname !== "string" || typeof title !== "string") {
      res.status(400).send("Dados inválidos fornecidos");
      return;
    }

    const query = await sql`
        INSERT INTO category (title, iconname)
        VALUES (${title}, ${iconname})
        RETURNING *;
    `;

    res.status(201).json({ ...query.rows[0], isfavorite, todoitems });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao criar nova categoria" });
  }
});

app.get("/category", async (req, res) => {
  try {
    const { rows } = await sql`
        SELECT c.id, c.iconname, c.isfavorite, c.title,
            COALESCE(json_agg(json_build_object('id', t.id, 'categoryid', t.categoryid, 'description', t.description, 'title', t.title, 'isimportant', t.isimportant, 'isdone', t.isdone)) FILTER (WHERE t.id IS NOT NULL), '[]') AS todoitems
        FROM category c
        LEFT JOIN to_do t ON c.id = t.categoryid
        GROUP BY c.id
        ORDER BY c.id;
    `;

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar categoria." });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
