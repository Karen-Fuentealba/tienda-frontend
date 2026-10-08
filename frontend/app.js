/**
 * Frontend simple para CRUD de productos de la tienda de perritos.
 */

// Determinar la URL base de la API según el host
// frontend/app.js

//const API_BASE = "/api/productos";

const API_BASE = "https://oyvhdgexqa.execute-api.us-east-1.amazonaws.com/dev/api";
const PRODUCTOS_API = `${API_BASE}/api/productos`;
const PEDIDOS_API   = `${API_BASE}/api/pedidos`;

// Ejemplo: const API_BASE = "http://10.0.2.30:3001/api/productos";


let editandoId = null;

const tbody = document.getElementById("tbodyProductos");
const btnCargar = document.getElementById("btnCargar");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const formTitle = document.getElementById("formTitle");
const statusDiv = document.getElementById("status");

const inputNombre = document.getElementById("nombre");
const inputDescripcion = document.getElementById("descripcion");
const inputPrecio = document.getElementById("precio");
const inputStock = document.getElementById("stock");
const accessView = document.getElementById("accessView");
const accessStatus = document.getElementById("accessStatus");
const appView = document.getElementById("appView");
const btnIniciarSesionAdmin = document.getElementById("btnIniciarSesionAdmin");
const btnIniciarSesionCliente = document.getElementById("btnIniciarSesionCliente");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const sessionIdentity = document.getElementById("sessionIdentity");
const clientView = document.getElementById("clientView");
const tbodyCatalogo = document.getElementById("tbodyCatalogo");
const tbodyPedidos = document.getElementById("tbodyPedidos");
const clienteStatus = document.getElementById("clienteStatus");
const cartWidget = document.getElementById("cartWidget");
const btnCarrito = document.getElementById("btnCarrito");
const cartPanel = document.getElementById("cartPanel");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const cartToast = document.getElementById("cartToast");
const btnConfirmarCompra = document.getElementById("btnConfirmarCompra");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
const PEDIDOS_API = "/api/pedidos";

let catalogoActual = [];
let carrito = [];
let cartToastTimer = null;

async function apiFetch(url, options = {}) {
  const accessToken = await authService.obtenerTokenDeAcceso();
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(url, { ...options, headers });
}

function setStatus(mensaje, tipo = "ok") {
  statusDiv.textContent = mensaje;
  statusDiv.className = "status " + tipo;
}

function setClienteStatus(mensaje, tipo = "ok") {
  clienteStatus.textContent = mensaje;
  clienteStatus.className = "status " + tipo;
}

function setAccessStatus(mensaje, tipo = "error") {
  accessStatus.textContent = mensaje;
  accessStatus.className = "status " + tipo;
}

async function cargarProductos() {
  try {
    const res = await apiFetch(API_BASE);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Error al cargar productos (${res.status}).`);
    }
    const data = await res.json();
    renderProductos(data);
    setStatus("Productos cargados correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setStatus(`No se pudieron cargar los productos: ${err.message}`, "error");
  }
}

function renderProductos(productos) {
  tbody.innerHTML = "";
  productos.forEach((p) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.descripcion || ""}</td>
      <td>$${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button data-id="${p.id}" class="btn-editar">Editar</button>
        <button data-id="${p.id}" class="btn-eliminar danger">Eliminar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Asignar eventos a los botones
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      editarProducto(id);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Seguro que deseas eliminar este producto?")) {
        eliminarProducto(id);
      }
    });
  });
}

function renderCatalogo(productos) {
  catalogoActual = productos;
  tbodyCatalogo.innerHTML = "";
  productos.forEach((producto) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${producto.descripcion || ""}</td>
      <td>$${Number(producto.precio).toFixed(2)}</td>
      <td>${producto.stock}</td>
      <td><button class="btn-comprar" data-id="${producto.id}" ${producto.stock <= 0 ? "disabled" : ""}>Comprar</button></td>
    `;
    tbodyCatalogo.appendChild(tr);
  });

  document.querySelectorAll(".btn-comprar").forEach((button) => {
    button.addEventListener("click", () => agregarAlCarrito(Number(button.dataset.id)));
  });
}

function renderPedidos(pedidos) {
  tbodyPedidos.innerHTML = "";
  pedidos.forEach((pedido) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${pedido.producto}</td>
      <td>${pedido.cantidad}</td>
      <td>$${Number(pedido.precio_unitario).toFixed(2)}</td>
      <td>${new Date(pedido.created_at).toLocaleString()}</td>
    `;
    tbodyPedidos.appendChild(tr);
  });
}

async function cargarCatalogo() {
  try {
    const response = await apiFetch(API_BASE);
    if (!response.ok) throw new Error("No se pudo cargar el catálogo.");
    renderCatalogo(await response.json());
  } catch (error) {
    console.error(error);
    setClienteStatus("No se pudo cargar el catálogo.", "error");
  }
}

async function cargarPedidos() {
  try {
    const response = await apiFetch(PEDIDOS_API);
    if (!response.ok) throw new Error("No se pudo cargar el historial.");
    renderPedidos(await response.json());
  } catch (error) {
    console.error(error);
    setClienteStatus("No se pudo cargar el historial de pedidos.", "error");
  }
}

function mostrarAvisoCarrito(mensaje) {
  cartToast.textContent = mensaje;
  cartToast.hidden = false;
  clearTimeout(cartToastTimer);
  cartToastTimer = setTimeout(() => {
    cartToast.hidden = true;
  }, 2000);
}

function renderCarrito() {
  cartItems.innerHTML = "";
  let total = 0;
  let unidades = 0;

  carrito.forEach((item) => {
    total += item.precio * item.cantidad;
    unidades += item.cantidad;

    const li = document.createElement("li");
    const detalle = document.createElement("span");
    detalle.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "danger";
    quitar.textContent = "Quitar";
    quitar.addEventListener("click", () => {
      carrito = carrito.filter((producto) => producto.id !== item.id);
      renderCarrito();
    });
    li.append(detalle, quitar);
    cartItems.appendChild(li);
  });

  cartCount.textContent = String(unidades);
  cartEmpty.hidden = carrito.length > 0;
  cartTotal.textContent = carrito.length ? `Total: $${total.toFixed(2)}` : "";
  btnConfirmarCompra.disabled = false;
  btnConfirmarCompra.hidden = carrito.length === 0;
  btnVaciarCarrito.hidden = carrito.length === 0;
}

function agregarAlCarrito(productId) {
  const producto = catalogoActual.find((item) => item.id === productId);
  if (!producto) return;

  const existente = carrito.find((item) => item.id === productId);
  const cantidadActual = existente ? existente.cantidad : 0;
  if (cantidadActual + 1 > producto.stock) {
    setClienteStatus(`No hay más stock disponible de ${producto.nombre}.`, "error");
    return;
  }

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: Number(producto.precio), cantidad: 1 });
  }

  setClienteStatus("", "ok");
  renderCarrito();
  mostrarAvisoCarrito("Producto Agregado al Carrito de Compras");
}

async function confirmarCompra() {
  if (!carrito.length) return;
  btnConfirmarCompra.disabled = true;

  try {
    for (const item of [...carrito]) {
      const response = await apiFetch(PEDIDOS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id, quantity: item.cantidad }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || `No se pudo crear el pedido de ${item.nombre}.`);
      carrito = carrito.filter((producto) => producto.id !== item.id);
    }
    setClienteStatus("Pedido creado correctamente.", "ok");
    cartPanel.hidden = true;
    btnCarrito.setAttribute("aria-expanded", "false");
  } catch (error) {
    console.error(error);
    setClienteStatus(error.message || "No se pudo crear el pedido.", "error");
  } finally {
    renderCarrito();
    await Promise.all([cargarCatalogo(), cargarPedidos()]);
  }
}

function limpiarFormulario() {
  editandoId = null;
  formTitle.textContent = "Nuevo producto";
  inputNombre.value = "";
  inputDescripcion.value = "";
  inputPrecio.value = "";
  inputStock.value = "";
}

function obtenerDatosFormulario() {
  return {
    nombre: inputNombre.value.trim(),
    descripcion: inputDescripcion.value.trim(),
    precio: parseFloat(inputPrecio.value),
    stock: parseInt(inputStock.value, 10),
  };
}

function validarProducto(prod) {
  if (!prod.nombre) return "El nombre es obligatorio.";
  if (isNaN(prod.precio) || prod.precio < 0) return "El precio debe ser un número mayor o igual a 0.";
  if (isNaN(prod.stock) || prod.stock < 0) return "El stock debe ser un número mayor o igual a 0.";
  return null;
}

async function guardarProducto() {
  const producto = obtenerDatosFormulario();
  const error = validarProducto(producto);
  if (error) {
    setStatus(error, "error");
    return;
  }

  try {
    let res;
    if (editandoId) {
      // Actualizar
      res = await apiFetch(`${API_BASE}/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    } else {
      // Crear
      res = await apiFetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Error al guardar el producto");
    }

    limpiarFormulario();
    await cargarProductos();
    setStatus(editandoId ? "Producto actualizado correctamente." : "Producto creado correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("Ocurrió un error al guardar el producto.", "error");
  }
}

async function editarProducto(id) {
  try {
    const res = await apiFetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("No se pudo obtener el producto");
    const p = await res.json();
    editandoId = p.id;
    formTitle.textContent = `Editar producto #${p.id}`;
    inputNombre.value = p.nombre;
    inputDescripcion.value = p.descripcion || "";
    inputPrecio.value = p.precio;
    inputStock.value = p.stock;
    setStatus("Editando producto.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("No se pudo cargar el producto para editarlo.", "error");
  }
}

async function eliminarProducto(id) {
  try {
    const res = await apiFetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar producto");
    await cargarProductos();
    setStatus("Producto eliminado correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("No se pudo eliminar el producto.", "error");
  }
}

// Eventos
btnCargar.addEventListener("click", cargarProductos);
btnGuardar.addEventListener("click", guardarProducto);
btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
  setStatus("Edición cancelada.", "ok");
});

btnCarrito.addEventListener("click", () => {
  cartPanel.hidden = !cartPanel.hidden;
  btnCarrito.setAttribute("aria-expanded", String(!cartPanel.hidden));
});
btnConfirmarCompra.addEventListener("click", confirmarCompra);
btnVaciarCarrito.addEventListener("click", () => {
  carrito = [];
  renderCarrito();
});

btnIniciarSesionAdmin.addEventListener("click", () => {
  authService.iniciarSesion("admin").catch((error) => {
    console.error(error);
    setAccessStatus(`No se pudo iniciar la sesión de administrador: ${error.message}`);
  });
});

btnIniciarSesionCliente.addEventListener("click", () => {
  authService.iniciarSesion("cliente").catch((error) => {
    console.error(error);
    setAccessStatus(`No se pudo iniciar la sesión de cliente: ${error.message}`);
  });
});

btnCerrarSesion.addEventListener("click", () => {
  authService.cerrarSesion();
});

async function iniciarAplicacion() {
  try {
    const account = await authService.inicializarAutenticacion();
    if (!account) {
      return;
    }

    const roles = await authService.obtenerRoles();
    const nombre = account.name || account.username || "Usuario";
    accessView.hidden = true;
    btnCerrarSesion.hidden = false;
    if (roles.includes("ADMIN")) {
      sessionIdentity.textContent = `Administrador: ${nombre}`;
      sessionIdentity.hidden = false;
      appView.hidden = false;
      await cargarProductos();
      return;
    }
    if (roles.includes("CLIENTE")) {
      sessionIdentity.textContent = `Cliente: ${nombre}`;
      sessionIdentity.hidden = false;
      clientView.hidden = false;
      cartWidget.hidden = false;
      renderCarrito();
      await Promise.all([cargarCatalogo(), cargarPedidos()]);
      return;
    }
    accessView.hidden = false;
    btnCerrarSesion.hidden = true;
    sessionIdentity.hidden = true;
  } catch (error) {
    console.error("No se pudo inicializar la autenticación:", error);
    accessView.hidden = false;
    setAccessStatus(`No se pudo completar el inicio de sesión de Azure: ${error.message}`);
  }
}

iniciarAplicacion();
