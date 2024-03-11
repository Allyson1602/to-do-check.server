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
    const result = await sql`
      DELETE FROM to_do
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.rowCount === 0) {
      return res.status(404).send({ message: "To Do não encontrado" });
    }

    res.status(200).json({ id: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao deletar To Do" });
  }
});

app.put("/to-do/:id", async (req, res) => {
  const { id } = req.params;
  const { description, title, isImportant, isDone } = req.body;

  try {
    const result = await sql`
      UPDATE to_do
      SET title = ${title}, description = ${description}, isimportant = ${isImportant}, isdone = ${isDone}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.rowCount === 0) {
      return res.status(404).send({ message: "To Do não encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao atualizar To Do" });
  }
});

app.post("/to-do", async (req, res) => {
  const { categoryId, description, title } = req.body;

  if (
    typeof description !== "string" ||
    typeof title !== "string" ||
    typeof categoryId !== "number"
  ) {
    res.status(400).send("Dados inválidos fornecidos");
    return;
  }

  try {
    const query = await sql`
        INSERT INTO to_do (categoryid, title, description)
        VALUES (${categoryId}, ${title}, ${description})
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

  const result = await sql`
    DELETE FROM category
    WHERE id = ${id}
    RETURNING *;
  `;

  if (result.rowCount === 0) {
    return res.status(404).send({ message: "Categoria não encontrada" });
  }

  res.status(200).json({ id: result.rows[0] });
});

app.put("/category/:id", async (req, res) => {
  const { id } = req.params;
  const { iconName, isFavorite, title } = req.body;

  if (!id) {
    return res
      .status(400)
      .send("É necessário fornecer o ID da categoria para atualização.");
  }

  if (
    isFavorite !== undefined ||
    iconName !== undefined ||
    title !== undefined
  ) {
    return res
      .status(400)
      .send("Informe todos os dados necessários para atualização");
  }

  const query = await sql`
    UPDATE category
    SET title = ${title}, iconname = ${iconName}, isfavorite = ${isFavorite}
    WHERE id = ${id}
    RETURNING *;
  `;

  if (result.rowCount === 0) {
    return res.status(404).send("Categoria não encontrada");
  }

  res.status(200).json(query.rows[0]);
});

app.post("/category", async (req, res) => {
  const { iconName, title } = req.body;
  const isFavorite = false;
  const todoItems = [];

  try {
    if (typeof iconName !== "string" || typeof title !== "string") {
      res.status(400).send("Dados inválidos fornecidos");
      return;
    }

    const query = await sql`
        INSERT INTO category (iconname, title)
        VALUES (${title}, ${iconName})
        RETURNING *;
    `;

    res.status(201).json({ ...result.rows[0] }, isFavorite, todoItems);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao criar nova categoria" });
  }
});

app.get("/category", async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM category`;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar categoria." });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
