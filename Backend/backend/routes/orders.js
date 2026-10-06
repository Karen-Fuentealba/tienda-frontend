const express = require("express");
const { checkJwt, checkRole } = require("../auth");

function createOrderRoutes(controller) {
  const router = express.Router();

  router.post("/", checkJwt, checkRole("CLIENTE"), controller.createOrder);
  router.get("/", checkJwt, checkRole(["ADMIN", "CLIENTE"]), controller.listOrders);

  return router;
}

module.exports = { createOrderRoutes };