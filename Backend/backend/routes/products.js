const express = require("express");
const { checkJwt, checkRole } = require("../auth");

function createProductRoutes(controller) {
  const router = express.Router();

  router.get("/", checkJwt, checkRole(["ADMIN", "CLIENTE"]), controller.listProducts);
  router.get("/:id", checkJwt, checkRole("ADMIN"), controller.getProduct);
  router.post("/", checkJwt, checkRole("ADMIN"), controller.createProduct);
  router.put("/:id", checkJwt, checkRole("ADMIN"), controller.updateProduct);
  router.delete("/:id", checkJwt, checkRole("ADMIN"), controller.deleteProduct);

  return router;
}

module.exports = { createProductRoutes };