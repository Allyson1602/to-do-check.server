const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./database");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

app.post("/to-do", (req, res) => {
  const { description, title, categoryId } = req.body;

  if (
    typeof description !== "string" ||
    typeof title !== "string" ||
    typeof categoryId !== "number"
  ) {
    res.status(400).send("Dados inválidos fornecidos");
    return;
  }

  const categoryQuery = `SELECT id FROM category WHERE id = ?`;

  db.get(categoryQuery, [categoryId], (err, category) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao verificar a categoria");
      return;
    }

    if (!category) {
      res.status(404).send("Categoria não encontrada");
      return;
    }

    // Insere o novo todoItem no banco de dados
    const insertQuery = `INSERT INTO to_do (description, title, categoryId) VALUES (?, ?, ?)`;

    db.run(insertQuery, [description, title, categoryId], function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send("Erro ao criar o todoItem");
        return;
      }

      const newItemId = this.lastID;
      db.get(
        `SELECT * FROM to_do WHERE id = ?`,
        [newItemId],
        (err, newItem) => {
          if (err) {
            console.error(err.message);
            res.status(500).send("Erro ao buscar o todoItem criado");
            return;
          }
          res.status(201).json(newItem);
        }
      );
    });
  });
});

app.delete("/category/:id", (req, res) => {
  const { id } = req.params;

  const deleteQuery = `DELETE FROM category WHERE id = ?`;

  db.run(deleteQuery, [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao deletar a categoria");
      return;
    }
    if (this.changes === 0) {
      res.status(404).send("Categoria não encontrada");
      return;
    }

    res.json({ id: parseInt(id) });
  });
});

app.put("/category/:id", (req, res) => {
  const { id } = req.params;
  const { iconName, isFavorite, title } = req.body;

  if (!id) {
    return res
      .status(400)
      .send("É necessário fornecer o ID da categoria para atualização.");
  }

  const fieldsToUpdate = [];
  const values = [];

  if (iconName !== undefined) {
    fieldsToUpdate.push(`iconName = ?`);
    values.push(iconName);
  }

  if (isFavorite !== undefined) {
    fieldsToUpdate.push(`isFavorite = ?`);
    values.push(isFavorite ? 1 : 0);
  }

  if (title !== undefined) {
    fieldsToUpdate.push(`title = ?`);
    values.push(title);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).send("Nenhum dado fornecido para atualização.");
  }

  const updateQuery = `UPDATE category SET iconName = ?, isFavorite = ?, title = ? WHERE id = ?`;

  db.run(updateQuery, [iconName, isFavorite, title, id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao atualizar a categoria");
      return;
    }

    if (this.changes === 0) {
      res.status(404).send("Categoria não encontrada");
      return;
    }

    db.get(`SELECT * FROM category WHERE id = ?`, [id], (err, category) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Erro ao buscar a categoria atualizada");
        return;
      }

      db.all(
        `SELECT * FROM to_do WHERE categoryId = ?`,
        [id],
        (err, todoItems) => {
          if (err) {
            console.error(err.message);
            res.status(500).send("Erro ao buscar todoItems da categoria");
            return;
          }

          category.todoItems = todoItems;
          res.json(category);
        }
      );
    });
  });
});

app.post("/category", (req, res) => {
  const { iconName, title } = req.body;
  const isFavorite = false;
  const todoItems = [];

  if (typeof iconName !== "string" || typeof title !== "string") {
    res.status(400).send("Dados inválidos fornecidos");
    return;
  }

  const query = `INSERT INTO category (iconName, title) VALUES (?, ?)`;

  db.run(query, [iconName, title], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao criar a categoria");
      return;
    }

    res
      .status(201)
      .json({ id: this.lastID, iconName, title, isFavorite, todoItems });
  });
});

app.get("/category", async (req, res) => {
  db.all(`SELECT * FROM category`, [], (err, categories) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao buscar categorias");
      return;
    }

    let categoriesProcessed = 0;

    if (categories.length === 0) {
      res.json([]);
    } else {
      categories.forEach((category, index, array) => {
        db.all(
          `SELECT * FROM to_do WHERE categoryId = ?`,
          [category.id],
          (err, items) => {
            if (err) {
              console.error(err.message);
              res
                .status(500)
                .send("Erro ao buscar to_do para a categoria: " + category.id);
              return;
            }

            array[index].todoItems = items;

            categoriesProcessed++;
            if (categoriesProcessed === array.length) {
              res.json(categories);
            }
          }
        );
      });
    }
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
