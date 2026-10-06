function createProductController(pool) {
  async function listProducts(req, res) {
    try {
      const [rows] = await pool.query("SELECT id, nombre, descripcion, precio, stock FROM productos ORDER BY id DESC");
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No se pudieron obtener los productos." });
    }
  }

  async function getProduct(req, res) {
    try {
      const [rows] = await pool.query("SELECT id, nombre, descripcion, precio, stock FROM productos WHERE id = ?", [req.params.id]);
      if (rows.length === 0) {
        res.status(404).json({ message: "Producto no encontrado." });
        return;
      }
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No se pudo obtener el producto." });
    }
  }

  async function createProduct(req, res) {
    const { nombre, descripcion, precio, stock } = req.body;
    if (!nombre || precio == null || stock == null) {
      res.status(400).json({ message: "Nombre, precio y stock son obligatorios." });
      return;
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
        [nombre, descripcion || null, precio, stock]
      );
      const [rows] = await pool.query("SELECT id, nombre, descripcion, precio, stock FROM productos WHERE id = ?", [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No se pudo crear el producto." });
    }
  }

  async function updateProduct(req, res) {
    const { nombre, descripcion, precio, stock } = req.body;
    if (!nombre || precio == null || stock == null) {
      res.status(400).json({ message: "Nombre, precio y stock son obligatorios." });
      return;
    }

    try {
      const [result] = await pool.query(
        "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?",
        [nombre, descripcion || null, precio, stock, req.params.id]
      );
      if (result.affectedRows === 0) {
        res.status(404).json({ message: "Producto no encontrado." });
        return;
      }
      const [rows] = await pool.query("SELECT id, nombre, descripcion, precio, stock FROM productos WHERE id = ?", [req.params.id]);
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No se pudo actualizar el producto." });
    }
  }

  async function deleteProduct(req, res) {
    try {
      const [result] = await pool.query("DELETE FROM productos WHERE id = ?", [req.params.id]);
      if (result.affectedRows === 0) {
        res.status(404).json({ message: "Producto no encontrado." });
        return;
      }
      res.json({ message: "Producto eliminado correctamente." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No se pudo eliminar el producto." });
    }
  }

  return { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
}

module.exports = { createProductController };