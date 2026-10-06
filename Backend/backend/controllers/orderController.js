function getClientId(auth) {
  return auth?.oid || auth?.sub;
}

function hasRole(auth, role) {
  return Array.isArray(auth?.roles) && auth.roles.includes(role);
}

function createOrderController(pool) {
  async function createOrder(req, res) {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);
    const clientId = getClientId(req.auth);

    if (!clientId || !Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ message: "Producto y cantidad válida son obligatorios." });
      return;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [products] = await connection.query(
        "SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE",
        [productId]
      );
      const product = products[0];

      if (!product) {
        await connection.rollback();
        res.status(404).json({ message: "Producto no encontrado." });
        return;
      }
      if (product.stock < quantity) {
        await connection.rollback();
        res.status(400).json({ message: "No hay stock suficiente para el pedido." });
        return;
      }

      const [result] = await connection.query(
        "INSERT INTO pedidos (cliente_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [clientId, product.id, quantity, product.precio]
      );
      await connection.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [quantity, product.id]);
      await connection.commit();

      res.status(201).json({
        id: result.insertId,
        productoId: product.id,
        producto: product.nombre,
        cantidad: quantity,
        precioUnitario: product.precio,
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);
      res.status(500).json({ message: "No se pudo crear el pedido." });
    } finally {
      connection.release();
    }
  }

  async function listOrders(req, res) {
    const isAdmin = hasRole(req.auth, "ADMIN");
    const clientId = getClientId(req.auth);

    if (!isAdmin && !clientId) {
      res.status(400).json({ message: "No se pudo identificar al cliente autenticado." });
      return;
    }

    try {
      const query = isAdmin
        ? "SELECT pe.id, pe.cliente_id, pe.cantidad, pe.precio_unitario, pe.created_at, pr.nombre AS producto FROM pedidos pe INNER JOIN productos pr ON pr.id = pe.producto_id ORDER BY pe.created_at DESC"
        : "SELECT pe.id, pe.cantidad, pe.precio_unitario, pe.created_at, pr.nombre AS producto FROM pedidos pe INNER JOIN productos pr ON pr.id = pe.producto_id WHERE pe.cliente_id = ? ORDER BY pe.created_at DESC";
      const [rows] = await pool.query(query, isAdmin ? [] : [clientId]);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No se pudo obtener el historial de pedidos." });
    }
  }

  return { createOrder, listOrders };
}

module.exports = { createOrderController };