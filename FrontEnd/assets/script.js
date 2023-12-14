const api = 'http://localhost:5678/api/';
let apiDataWorks = [];
let apiDataCategories = [];

const portfolioGallery = document.querySelector('#portfolio .gallery');
const modalGallery = document.querySelector('#modale_img .gallery');
const modal = document.querySelector('#overlay');

async function fetchData() {
  const apiDataWorksRes = await handleApiRequest('works');
  const apiDataCategoriesRes = await handleApiRequest('categories');
  apiDataWorks = apiDataWorksRes.data;
  apiDataCategories = apiDataCategoriesRes.data;
}

/**
 * Handles an API request.
 *
 * @param {string} endPoint - The API endpoint.
 * @param {string} [method='GET'] - The HTTP method.
 * @param {Object} [headers={}] - The request headers.
 * @param {Object|null} [body=null] - The request body.
 * @param {string} [errorMessage='Une erreur est survenue'] - The error message to display.
 * @returns {Promise<Object>} - The response data.
 */
async function handleApiRequest(
  endPoint,
  method = 'GET',
  headers = {},
  body = null,
  errorMessage = 'Une erreur est survenue',
  isBodyFormData = false
) {
  try {
    const res = await fetch(`${api}${endPoint}`, {
      method,
      headers,
      body: isBodyFormData ? body : !body ? null : JSON.stringify(body),
    });
    const status = res.status;
    if (status === 204) return { data: null, status };
    const data = await res.json();
    return { data, status };
  } catch (err) {
    console.error(err);
    document.querySelector('#error').innerText = errorMessage;
  }
}

/**
 * Creates a generic HTML element with optional attributes.
 *
 * @param {string} [elt='div'] - The type of element to create (default: 'div').
 * @param {string} [className=''] - The class name to assign to the element.
 * @param {string} [text=''] - The text content of the element.
 * @param {string} [id=''] - The ID to assign to the element.
 * @param {Array<Object>} [attributes=[]] - An array of attribute objects to set on the element.
 * @returns {HTMLElement} The created HTML element.
 */
function createGenericElement(
  elt = 'div',
  className = '',
  text = '',
  id = '',
  attributes = []
) {
  const elem = document.createElement(elt);
  if (className !== '') elem.className = className;
  if (text !== '') elem.innerText = text;
  if (id !== '') elem.id = id;
  attributes.forEach((attribute) => {
    elem.setAttribute(attribute.name, attribute.value);
  });
  return elem;
}

/**
 * Creates a card element for a given work item.
 *
 * @param {Object} currentWork - The current work item.
 * @param {Number} categoryId - The category ID to filter the works.
 * @param {HTMLElement} gallery - The gallery element to append the card to.
 * @param {boolean} [isModal=false] - Indicates if the card is being created for a modal.
 */
function createCard(currentWork, categoryId, gallery, isModal = false) {
  if (!categoryId || currentWork.categoryId === categoryId) {
    const titleWork = currentWork.title;
    const imgWork = currentWork.imageUrl;

    const workDisplay = createGenericElement('figure', '');
    const workImg = createGenericElement('img', '', '', '', [
      { name: 'src', value: imgWork },
      { name: 'alt', value: titleWork },
    ]);
    const workTitle = createGenericElement('figcaption', '', titleWork);

    workDisplay.appendChild(workImg);
    workDisplay.appendChild(workTitle);

    if (isModal) {
      const trashIcon = createGenericElement('i', 'fa-solid fa-trash-can');
      workDisplay.dataset.id = currentWork.id;
      workDisplay.appendChild(trashIcon);
    }

    gallery.appendChild(workDisplay);
  }
}

function displayWorks(categoryId, gallery, isModal = false) {
  gallery.innerHTML = '';

  for (let i = 0; i < apiDataWorks.length; i++) {
    createCard(apiDataWorks[i], categoryId, gallery, isModal);
  }
}

function displayButtons() {
  const filterButton = document.querySelector('#filter');

  const allCategory = document.createElement('li');
  allCategory.innerText = 'Tous';
  allCategory.addEventListener('click', () => {
    displayWorks(null, portfolioGallery);
    toggleFilterSelected(allCategory);
  });

  filterButton.appendChild(allCategory).classList.add('filter-selected');

  for (let i = 0; i < apiDataCategories.length; i++) {
    const categoryId = apiDataCategories[i].id;
    const categoryName = apiDataCategories[i].name;

    const nameCategory = document.createElement('li');
    nameCategory.innerText = categoryName;
    nameCategory.addEventListener('click', () => {
      displayWorks(categoryId, portfolioGallery);
      toggleFilterSelected(nameCategory);
    });

    filterButton.appendChild(nameCategory);
  }
}

function toggleFilterSelected(element) {
  const filterButtons = document.querySelectorAll('#filter li');
  filterButtons.forEach((button) => button.classList.remove('filter-selected'));
  element.classList.add('filter-selected');
}

async function init() {
  await fetchData();
  if (!portfolioGallery) return;
  displayWorks(null, portfolioGallery);
  if (isAuth) {
    addFilterOptions(apiDataCategories);
  } else {
    displayButtons();
  }
}

init();

const form = document.querySelector('.login_form');
if (form) {
  const fields = ['E-mail', 'password'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let error = 0;

    fields.forEach((field) => {
      const input = document.querySelector(`#${field}`);
      if (!validateFields(input)) {
        error++;
      }
    });

    if (error === 0) {
      const user = {
        email: document.querySelector('#E-mail').value,
        password: document.querySelector('#password').value,
      };

      handleApiRequest(
        'users/login',
        'POST',
        { 'Content-type': 'application/json' },
        user
      )
        .then((data) => {
          if (data.error) {
            console.error('Error:', data.message);
            document.querySelector('.error-message-all').style.display =
              'block';
            document.querySelector('.error-message-all').innerText =
              'Votre E-mail ou votre Mot de passe est incorrect';
          } else {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('auth', 1);
            form.submit();
          }
        })
        .catch((data) => {
          console.error('error:', data.message);
        });
    }
  });

  function validateFields(field) {
    if (field.value.trim() === '') {
      setStatus(
        field,
        `${field.previousElementSibling.innerText} ne peut pas être vide`,
        'error'
      );
      return false;
    } else {
      setStatus(field, null, 'success');
      return true;
    }
  }

  function setStatus(field, message, status) {
    const errorMessage = field.nextElementSibling;
    errorMessage.innerText = status === 'success' ? '' : message;
    field.classList.toggle('input-error');
  }
}

const logButton = document.querySelector('#login_logout');
const auth = localStorage.getItem('auth');
const isAuth = auth === '1';

if (isAuth) {
  logout();
  addEditModeElements();
  modalToggle();
}

function logout() {
  logButton.innerText = 'logout';
  logButton.parentElement.href = 'index.html';

  logButton.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  });
}

function addEditModeElements() {
  const header = document.querySelector('body');
  const projet = document.querySelector('#portfolio h2');

  const headerEdition = createGenericElement('div', 'header_edition');
  const headerEditionText = createGenericElement('p');
  const projetEdition = createGenericElement('span', '', '', 'modifier');

  headerEditionText.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Mode édition`;
  projetEdition.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> modifier`;

  header.insertBefore(headerEdition, header.firstChild);
  headerEdition.appendChild(headerEditionText);
  projet.appendChild(projetEdition);
}

function modalToggle() {
  const modalImg = document.querySelector('#modale_img');
  const modifierBtn = document.querySelector('#modifier');
  const modalCrosses = document.querySelectorAll('.cross');
  const returnArrow = document.querySelector('.return_arrow');
  const addImg = document.querySelector('#modale_img input');
  const modalImgUpload = document.querySelector('#modal_img_upload');

  document.addEventListener('click', (event) => {
    if (
      event.target === modal ||
      event.target === modifierBtn ||
      Array.from(modalCrosses).includes(event.target)
    ) {
      modal.classList.toggle('hide');
      modalImg.classList.remove('hide');
      modalImgUpload.classList.add('hide');

      if (modalImg) {
        displayWorks(null, modalImg.querySelector('.gallery'), true);
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target === addImg || event.target === returnArrow) {
      modalImg.classList.toggle('hide');
      modalImgUpload.classList.toggle('hide');
    }
  });
}

function addFilterOptions(categories) {
  const filtersSelect = document.getElementById('filters');

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.text = category.name;

    filtersSelect.appendChild(option);
  });
}

const imageInput = document.getElementById('imageInput');
const imgUploadDiv = document.getElementById('img_upload');
const uploadedImage = document.getElementById('uploadedImage');
const imgUploadButton = document.querySelector(
  '#img_upload input[type="button"]'
);
const imgUploadIcon = document.querySelector('#img_upload p');
const imgUploadParagraph = document.querySelector('#img_upload p');
const imgUploadForm = document.getElementById('imgUploadForm');

imageInput.addEventListener('change', resetImageUploadInterface);
document.querySelector('.return_close').addEventListener('click', resetModal);
imageInput.addEventListener('change', handleImageUpload);

function resetImageUploadInterface() {
  resetModal();
  handleImageUpload();
}

function resetModal() {
  imgUploadDiv.style.backgroundImage = 'none';
  uploadedImage.src = '';
  uploadedImage.style.display = 'none';
  imgUploadButton.style.display = 'inline-block';
  imgUploadParagraph.style.display = 'block';
  imgUploadForm.style.display = 'block';
}

function handleImageUpload() {
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      uploadedImage.src = e.target.result;

      uploadedImage.style.display = 'flex';
      imageInput.style.display = 'none';
      imgUploadButton.style.display = 'none';
      imgUploadParagraph.style.display = 'none';
      imgUploadForm.style.display = 'none';
      imgUploadIcon.style.display = 'none';
    };
    reader.readAsDataURL(imageInput.files[0]);
  }
}

const imageUploadForm = document.querySelector('form#img_upload_form');
imageUploadForm.addEventListener('submit', (e) => {
  e.preventDefault();
  uploadImg();
});

const user = JSON.parse(localStorage.getItem('user'));
async function uploadImg() {
  try {
    const file = document.getElementById('imageInput').files[0];
    const title = document.getElementById('title').value;
    const categoryId = document.getElementById('filters').value;

    if (!categoryId) {
      alert('Veuillez choisir une catégorie');
      return;
    } else if (!title) {
      alert('Veuillez ajouter un titre');
      return;
    }

    let formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', parseInt(categoryId));

    const response = await handleApiRequest(
      'works',
      'POST',
      { Authorization: `Bearer ${user.token}` },
      formData,
      "Une erreur est survenue lors de l'ajout de l'image",
      true
    );

    switch (response.status) {
      case 201:
        console.error('Image uploaded successfully');
        alert('Votre image a bien été ajoutée');
        break;
      case 400:
        console.error('Bad request');
        break;
      case 401:
        console.error('Unauthorized');
        break;
      default:
        console.error('Unexpected error');
    }

    await fetchData();
    displayWorks(null, modalGallery);
    displayWorks(null, portfolioGallery);
  } catch (error) {
    alert(`Une erreur est survenue + ${error.message}`);
    console.log(error);
  }

  modal.classList.toggle('hide');
  resetModal();
}

async function deleteImg(imgId) {
  const response = await handleApiRequest(`works/${imgId}`, 'DELETE', {
    Authorization: `Bearer ${user.token}`,
  });

  switch (response.status) {
    case 204:
      console.error('Image supprimée avec succès');
      break;
    case 401:
      console.error('Unauthorized');
      break;
    default:
      console.error('Unexpected error');
  }

  await fetchData();
  displayWorks(null, modalGallery);
  displayWorks(null, portfolioGallery);
}

const modalImg = document.querySelector('#modale_img');
modalImg.addEventListener('click', (e) => {
  if (e.target.classList.contains('fa-trash-can')) {
    const imgId = parseInt(e.target.parentElement.dataset.id);
    deleteImg(imgId);
  }
});
