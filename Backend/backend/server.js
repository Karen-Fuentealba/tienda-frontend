const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { createProductController } = require("./controllers/productController");
const { createOrderController } = require("./controllers/orderController");
const { createProductRoutes } = require("./routes/products");
const { createOrderRoutes } = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3001;

const {
  DB_HOST = "db",
  DB_USER = "alumno",
  DB_PASSWORD = "alumno123",
  DB_NAME = "tienda_perritos",
  DB_PORT = 3306,
} = process.env;

app.use(cors());
app.use(express.json());

let pool;

async function initDb() {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log("Pool de conexiones MySQL inicializado.");
  } catch (err) {
    console.error("Error al inicializar pool de MySQL:", err);
  }
}

async function registerRoutes() {
  await initDb();
  const productController = createProductController(pool);
  const orderController = createOrderController(pool);
  app.use("/api/productos", createProductRoutes(productController));
  app.use("/api/pedidos", createOrderRoutes(orderController));
}

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend de tienda de perritos en ejecución." });
});

// Iniciar servidor
async function start() {
  await registerRoutes();
  app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar el backend:", error);
  process.exit(1);
});
