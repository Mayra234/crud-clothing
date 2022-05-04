let clothings = [];
const clothingApi = useClothingApi();
const clothingForm = document.getElementById('clothing-form');
const fields = document.querySelectorAll('#clothing-form .form-field');
const clothingTbody = document.getElementById('clothing-table');
const contentButtons = document.getElementById('content-buttons');
const addButton = document.getElementById('add-clothing');
addButton.addEventListener('click', clothingFormAction);

const loader = document.getElementById('loader');

const handleLoader = (status) => {
  switch (status) {
    case 'show':
      loader.style.display = 'flex';
      break;
    case 'hide':
      loader.style.display = 'none';
      break;
    default:
      break;
  }
};

let clothingFormMode = 'create';
let clothingId = undefined;

let currentClothing = {
  name: '',
  quantity: '',
  brand: '',
  price: '',
  description: '',
};

function validate(event) {
  const { name, value } = event.target;
  currentClothing[name] = value;
}

fields.forEach((field) => {
  field.addEventListener('input', validate);
});

function clothingFormAction() {
  switch (clothingFormMode) {
    case 'create':
      createClothing();
      break;
    case 'update':
      updateClothing();
      break;
    default:
      break;
  }
}

function changeActionClothingButton() {
  switch (clothingFormMode) {
    case 'create':
      addButton.innerText = 'Agregar';
      addButton.className = 'btn btn-primary';
      break;
    case 'update':
      addButton.innerText = 'Actualizar';
      addButton.className = 'btn btn-info text-white';
      break;
    default:
      break;
  }
}

function cancelClothingActionButton() {
  switch (clothingFormMode) {
    case 'create':
      document.getElementById('cancel-button').remove();
      break;
    case 'update':
      if (document.getElementById('cancel-button') !== null) {
        return;
      } else {
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.innerText = 'Cancelar';
        cancelButton.type = 'button';
        cancelButton.addEventListener('click', () => {
          cancelButton.remove();
          clothingFormMode = 'create';
          clothingForm.reset();
          changeActionClothingButton();
        });
        contentButtons.appendChild(cancelButton);
      }

      break;
    default:
      break;
  }
}

async function createClothing() {
  handleLoader('show');
  const clothing = await clothingApi.create(currentClothing);
  clothings.push({ ...clothing });
  listClothings();
  clothingForm.reset();
  handleLoader('hide');
}

async function updateClothing() {
  handleLoader('show');
  const clothing = await clothingApi.update(clothingId, currentClothing);
  clothings = clothings.map((item) => {
    if (item.id === clothingId) {
      return { ...clothing };
    }

    return item;
  });
  listClothings();
  clothingForm.reset();
  clothingFormMode = 'create';
  changeActionClothingButton();
  cancelClothingActionButton();
  handleLoader('hide');
}

async function deleteClothing(id) {
  handleLoader('show');
  await clothingApi.remove(id);
  clothings = clothings.filter((clothing) => {
    return clothing.id !== id;
  });
  listClothings();
  handleLoader('hide');
}

function loadClothingInForm(id) {
  clothingFormMode = 'update';
  clothingId = id;
  currentClothing = clothings.find((clothing) => clothing.id === id);

  fields.forEach((field) => {
    field.value = currentClothing[field.name];
  });
  changeActionClothingButton();
  cancelClothingActionButton();
}

const modalHtmlElement = document.getElementById('view-clothing');
const boostrapModal = new bootstrap.Modal(modalHtmlElement);

async function showClothing(id) {
  handleLoader('show');
  const clothing = await clothingApi.read(id);
  const modalTitle = document.querySelector('#view-clothing .modal-title');
  const modalBody = document.querySelector('#view-clothing .modal-body');
  boostrapModal.show();
  modalBody.innerHTML = `
      <ul>
        <li><b>Nombre:</b> ${clothing.clothing}</li>
        <li><b>Cantidad:</b> ${clothing.quantity}</li>
        <li><b>Marca:</b> ${clothing.brand}</li>
        <li><b>Precio:</b> ${clothing.price}</li>
        <li><b>Descripción:</b><p>${clothing.description}</p></li>
    </ul>
      `;
  modalTitle.innerText = clothing.name;
  handleLoader('hide');
}

async function listClothings(firstLoad) {
  handleLoader('show');
  clothingTbody.innerHTML = '';
  if (firstLoad) clothings = await clothingApi.list();
  clothings.forEach((clothing) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <th scope="row">${clothing.id}</th>
            <td>${clothing.clothing}</td>
            <td>${clothing.quantity}</td>
            <td>${clothing.brand}</td>
            <td>${clothing.price}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadClothingInForm(${clothing.id})">
                    Editar
                    </button>
                <button
                    type="button"
                    class="btn btn-info text-white"
                    onclick="showClothing(${clothing.id})">
                    Ver registro
                    </button>
                <button
                    type="button"
                    class="btn btn-danger"
                    onclick="deleteClothing(${clothing.id})">
                    Eliminar
                    </button>
            </td>
        `;
    clothingTbody.appendChild(row);
  });
  handleLoader('hide');
}
listClothings(true);
