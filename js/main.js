"use strict";

const url = "https://5fc82e232af77700165ad172.mockapi.io/api/productos";
const modalEl = document.getElementById("container-mdl");
const tableContainer = document.getElementById("tbl-container");
let tableEl = document.getElementById("table");

//contenedor de la progressbar
let progressContainerEl = document.getElementById("progress-container");

//contenedor de los controles de la tabla
const tableCtrl = document.getElementById("tbl-ctrl");

//checkbox tuneado como toggle switch con Bootstrap 4
const switchEl = document.createElement("input");

//select para filtros
const selectEl = document.createElement("select");
selectEl.addEventListener("change", showFilterInput);

// botones "Aceptar" y cancelar del modal
const okEl = document.getElementById("ok");
const cancelEl = document.getElementById("cancel");

//campos para manipular los datos del array
let itemEl = document.getElementById("item");
let marcaEl = document.getElementById("marca");
let presentacionEl = document.getElementById("presentacion");
let precioEl = document.getElementById("precio");

//variable de alcance global para manipular los datos que traigo con fetch
//creo que hay una forma de evitar esta variable pero aún no domino scope como para
//lograrlo sin el auxiliar
let productos = null;

//leo los datos del servidor y los pongo disponibles
function getJSON() {
  fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      productos = data;
      //Invoca la función que crea la tabla
      createTableCtrl();
      buildTable(productos);
    });
}

//crea registro nuevo en el JSON original
function writeJson() {
fetch(url, {
  method: "POST",  
  body: JSON.stringify({
    item: itemEl.value,
    marca: marcaEl.value,
    presentacion: presentacionEl.value,
    precio: precioEl.value    
}),
headers: {"Content-Type": "application/JSON"}
})
.then(response => response.json())
}
//modifica registro existente en el JSON original
function editJson(index) {
  const slash = "/"
  const id = productos[index].id
  const combinedURL = url.concat(slash+id)
fetch(combinedURL, {
  method: "PUT",  
  body: JSON.stringify({
    item: itemEl.value,
    marca: marcaEl.value,
    presentacion: presentacionEl.value,
    precio: precioEl.value    
}),
headers: {"Content-Type": "application/JSON"}
})
.then(response => response.json())
}
//elimina registro del JSON original
function deleteJson(index) {
  const slash = "/"
  const id = productos[index].id
  const combinedURL = url.concat(slash+id)
fetch(combinedURL, {
  method: "DELETE",    
})
.then(response => response.json())
.then(json => console.log(json))
}

//crea controles de la tabla ("agregar" y filtros)
function createTableCtrl() {
  //botón "agregar"
  const ctrlDiv = document.createElement("div");
  ctrlDiv.className = "container-flex";
  const addBtnEl = document.createElement("button");
  const addBtnTxt = document.createTextNode("AGREGAR");
  addBtnEl.classList.add("btn", "btn-success", "m-1");
  addBtnEl.appendChild(addBtnTxt);
  addBtnEl.id = "addBtnEl";
  tableCtrl.appendChild(addBtnEl);
  addBtnEl.addEventListener("click", addItem);

  //toggle switch (checkbox tuneado)
  const switchEl = document.createElement("input");
  switchEl.type = "checkbox";
  switchEl.id = "toggleSwitch";
  switchEl.className = "switch";
  tableCtrl.appendChild(switchEl);
  switchEl.addEventListener("change", function () {
    if (this.checked == true) {      
      selectEl.classList.remove("d-none");
    } else {      
      selectEl.classList.add("d-none");
    }
  });

  //filtros
  selectEl.name = "filter";
  selectEl.id = "filter";
  selectEl.classList.add("d-none");
  const optionA = document.createElement("option");
  optionA.id = "noFilter";
  optionA.textContent = "Mostrar todos los productos";
  selectEl.appendChild(optionA);
  const optionB = document.createElement("option");
  optionB.id = "maxPrice";
  optionB.textContent = "Filtrar por precio máximo";
  selectEl.appendChild(optionB);
  tableCtrl.appendChild(selectEl);

  //input para filtrar por precio máximo
  const inputEl = document.createElement("input");
  inputEl.id = "inputEl";
  inputEl.className = "inputEl";
  inputEl.type = "number";
  inputEl.classList.add("d-none");
  tableCtrl.appendChild(inputEl);

  //botón "filtrar" y "cancelar"
  const filterBtn = document.createElement("button");
  const filterBtnTxt = document.createTextNode("FILTRAR");
  filterBtn.appendChild(filterBtnTxt);
  filterBtn.id = "filterBtn";
  filterBtn.classList.add("btn", "btn-primary", "m-1");
  tableCtrl.appendChild(filterBtn);
  filterBtn.classList.add("d-none");
  filterBtn.addEventListener("click", filterData); //handler "filtrar"
  const cancelFilterBtn = document.createElement("button");
  const cancelFilterBtnTxt = document.createTextNode("CANCELAR");
  cancelFilterBtn.appendChild(cancelFilterBtnTxt);
  cancelFilterBtn.id = "cancelFilterBtn";
  cancelFilterBtn.classList.add("btn", "btn-secondary", "m-1");
  tableCtrl.appendChild(cancelFilterBtn);
  cancelFilterBtn.classList.add("d-none");
  cancelFilterBtn.addEventListener("click", resetFilter); //handler "cancelar"
}

//funciones de filtrado de tabla
function showFilterInput() {
  inputEl.classList.remove("d-none");
  filterBtn.classList.remove("d-none");
  cancelFilterBtn.classList.remove("d-none");
  addBtnEl.classList.add("d-none");
  selectEl.disabled = true;
}
function filterData() {
  let productosPorPrecio = productos.filter(function (e) {
    return e.precio <= parseFloat(inputEl.value);
  });
  if (productosPorPrecio.length == 0) {
    alert("no hay productos en el rango especificado");
  } else {
    tableEl.remove();
    tableEl = document.createElement("table");
    tableEl.classList.add("table", "table-dark", "mt-5", "py-1");
    tableEl.id = "table";
    tableContainer.appendChild(tableEl);
    hideCtrl();
    buildTable(productosPorPrecio);
    removeTableBtn();
    addTableCloseBtn();
  }
  inputEl.value = "";
}

//elimina los botones Editar y Agregar de la tabla
function removeTableBtn() {
  let tableButtons = Array.from(document.getElementsByClassName("btn"));
  tableButtons.splice(0, 5);
  tableButtons.forEach(function (e) {
    e.remove();
  });
}

//agrega el botón para cerrar la tabla filtrada
function addTableCloseBtn() {
  const closeBtn = document.createElement("button");
  const closeBtnTxt = document.createTextNode("VOLVER");
  closeBtn.classList.add("btn", "btn-primary", "btn-lg");
  const trEl = document.createElement("tr");
  const tdEl = document.createElement("td");
  tdEl.colSpan = "5";
  tdEl.className = "td-container";
  closeBtn.appendChild(closeBtnTxt);
  tdEl.appendChild(closeBtn);
  trEl.appendChild(tdEl);
  tableEl.appendChild(trEl);
  closeBtn.addEventListener("click", () => {
    tableEl.remove();
    tableEl = document.createElement("table");
    tableEl.classList.add("table", "table-dark", "mt-5", "py-1");
    tableEl.id = "table";
    tableContainer.appendChild(tableEl);
    resetFilter();
    showCtrl();
    buildTable(productos);
  });
}
// si eligió filtrar y cancela, se ocultan los controles de filtro y la opción del dropdown
//vuelve a "Mostrar todos los productos"
function resetFilter() {
  document.getElementById("toggleSwitch").checked = false;
  noFilter.selected = "true";
  inputEl.classList.add("d-none");
  filterBtn.classList.add("d-none");
  cancelFilterBtn.classList.add("d-none");
  addBtnEl.classList.remove("d-none");
  selectEl.classList.add("d-none");
  selectEl.disabled = false;
}

//construye la tabla
function buildTable(data) {
  const keyArray = getKeys(data);
  buildThead(keyArray);
  data.forEach((e) => {
    buildTableRows(e);
  });
}
//extrae las claves de un JSON y las retorna en un array
function getKeys(data) {
  return Object.keys(data[0]);
}
//construye el table head y tantas celdas header como claves haya en el array generado con getKeys()
function buildThead(keyArray) {
  let theadEl = document.createElement("thead");
  for (let key in keyArray) {
    let thEl = document.createElement("th");
    thEl.innerHTML = keyArray[key].toUpperCase();
    theadEl.appendChild(thEl);
    tableEl.appendChild(theadEl);
  }
}
//construye body (rows) de tabla tomando contenido de array que se le pasa
function buildTableRows(data) {
  const trEl = document.createElement("tr");
  for (let key in data) {
    let tdEl = document.createElement("td");
    tdEl.innerHTML = data[key];
    trEl.appendChild(tdEl);
  }
  tableEl.appendChild(trEl);
  const btnEdit = document.createElement("button"); //agrega btn editar y su handler
  const txtEdit = document.createTextNode("Editar");
  btnEdit.classList.add("btn", "btn-success", "btn-sm", "m-1");
  btnEdit.appendChild(txtEdit);
  trEl.appendChild(btnEdit);
  btnEdit.addEventListener("click", () => {
    showModal();
    editItem(trEl.rowIndex);
  });
  const btnDelete = document.createElement("button"); //agrega btn borrar y su handler
  const txtDelete = document.createTextNode("Borrar");
  btnDelete.classList.add("btn", "btn-danger", "btn-sm", "m-1");
  btnDelete.appendChild(txtDelete);
  trEl.appendChild(btnDelete);
  btnDelete.addEventListener("click", () => {
    showModal();
    deleteItem(trEl.rowIndex);
    deleteJson(trEl.rowIndex);
  });
}

//borra datos residuales de los inputs
function resetFields() {
  itemEl.value = "";
  marcaEl.value = "";
  presentacionEl.value = "";
  precioEl.value = "";
}

//oculta los controles "agregar" y "filtro"
function hideCtrl() {
  tableCtrl.classList.add("d-none");
}

//restablece los controles
function showCtrl() {
  tableCtrl.classList.remove("d-none");
}
//muestra el modal
function showModal() {
  progressContainerEl.classList.add("d-none");
  modalEl.classList.remove("d-none");
}
//oculta el modal
function hideModal() {
  modalEl.classList.add("d-none");
}

//muestra la barra de progreso
function progressBar() {
  let width = 0;
  let progressBarEl = document.getElementById("progress-bar");
  let counter = setInterval(barCompletion, 0);

  function barCompletion() {
    progressContainerEl.classList.remove("d-none");

    if (width >= 100) {
      clearInterval(counter);
      setTimeout(function () {
        progressBarEl.style.width = 0 + "%";
        hideModal();
      }, 1000);
    } else {
      width++;
      progressBarEl.style.width = width + "%";
    }
  }
}

//valida que haya datos ingresados en cada campo
function inputEmptyCheck(a, b, c, d) {  
  if (a == 0 || b == 0 || c == 0 || d == 0) {
    return false;
  } else {
    return true;
  }
}
//agrega un registro
function addItem() {  
  itemEl.disabled = false;
  marcaEl.disabled = false;
  presentacionEl.disabled = false;
  precioEl.disabled = false;
  resetFields();
  showModal();
  let cancelEv = () => {
    hideModal();
    okEl.removeEventListener("click", okEv, { once: true });
  };
  let okEv = () => {
    let flag = inputEmptyCheck(
      itemEl.value.length,
      marcaEl.value.length,
      presentacionEl.value.length,
      precioEl.value.length
    );
    if (flag) {
      writeJson();
      progressBar();
      let id = parseInt(productos[productos.length-1].id)+1;
      let item = itemEl.value;
      let marca = marcaEl.value;
      let presentacion = presentacionEl.value;
      let precio = precioEl.value;
      let newItem = { id, item, marca, presentacion, precio };
      productos.push(newItem);
      //elimino la tabla y vuelvo a crearla con datos actualizados puesto que el array cambió
      tableEl.remove();
      tableEl = document.createElement("table");
      tableEl.classList.add("table", "table-dark", "mt-5", "py-1");
      tableEl.id = "table";
      tableContainer.appendChild(tableEl);
      buildTable(productos);
      cancelEl.removeEventListener("click", cancelEv, { once: true });
    } else {
      alert("No deje campos vacíos");
      okEl.addEventListener("click", okEv, { once: true });
    }
  };
  cancelEl.addEventListener("click", cancelEv, { once: true });
  okEl.addEventListener("click", okEv, { once: true });
}

//borra un registro
function deleteItem(index) {
  itemEl.value = productos[index].item;
  marcaEl.value = productos[index].marca;
  presentacionEl.value = productos[index].presentacion;
  precioEl.value = `$ ${productos[index].precio}`;
  itemEl.disabled = true;
  marcaEl.disabled = true;
  presentacionEl.disabled = true;
  precioEl.disabled = true;

  let cancelEv = () => {
    hideModal();
    okEl.removeEventListener("click", okEv, { once: true });
  };
  let okEv = () => {
    progressBar();
    productos.splice(index, 1);
    tableEl.deleteRow(index);
    cancelEl.removeEventListener("click", cancelEv, { once: true });
  };
  cancelEl.addEventListener("click", cancelEv, { once: true });
  okEl.addEventListener("click", okEv, { once: true });
}

//modifica un registro (comprendo que tendría que haber reutilizado, por ejemplo, que borrar y editar
//usaran la misma función para cargar el dato y luego se bifurcara solo la decisión final -editar o eliminar-)
//por qué no lo hice? Porque temí no llegar a tiempo ya que eso debería haberlo planificado antes
//de largarme a programar.
function editItem(index) {
  itemEl.value = productos[index].item;
  marcaEl.value = productos[index].marca;
  presentacionEl.value = productos[index].presentacion;
  precioEl.value = productos[index].precio;
  itemEl.disabled = false;
  marcaEl.disabled = false;
  presentacionEl.disabled = false;
  precioEl.disabled = false;
  let cancelEv = () => {
    hideModal();
    okEl.removeEventListener("click", okEv, { once: true });
  };
  let okEv = () => {
    let flag = inputEmptyCheck(
      itemEl.value.length,
      marcaEl.value.length,
      presentacionEl.value.length,
      precioEl.value.length
    );
    if (flag) {
      editJson(index);
      productos[index].item = itemEl.value;
      productos[index].marca = marcaEl.value;
      productos[index].presentacion = presentacionEl.value;
      productos[index].precio = precioEl.value;
      tableEl.remove(); //elimino la tabla y vuelvo a crearla con datos actualizados
      tableEl = document.createElement("table");
      tableEl.classList.add("table", "table-dark", "mt-5", "py-1");
      tableEl.id = "table";
      tableContainer.appendChild(tableEl);
      buildTable(productos);
      progressBar();
      cancelEl.removeEventListener("click", cancelEv, { once: true });
    } else {
      alert("No deje campos vacíos");
      okEl.addEventListener("click", okEv, { once: true });
    }
  };
  cancelEl.addEventListener("click", cancelEv, { once: true });
  okEl.addEventListener("click", okEv, { once: true });
}
window.onload = getJSON();
