const api = 'http://localhost:5678/api/';
let apiDataWorks = [];
let apiDataCategories = [];

const portfolioGallery = document.querySelector('#portfolio .gallery');

async function fetchData() {
  apiDataWorks = await handleApiRequest('works');
  apiDataCategories = await handleApiRequest('categories');
}

async function handleApiRequest(
  endPoint,
  method = 'GET',
  headers = {},
  body = null,
  errorMessage = 'Une erreur est survenue'
) {
  try {
    const res = await fetch(`${api}${endPoint}`, {
      method,
      headers,
      body: !body ? null : JSON.stringify(body),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    document.querySelector('#error').innerText = errorMessage;
  }
}

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

function createCard(currentWork, categoryId, gallery) {
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

    gallery.appendChild(workDisplay);
  }
}

function displayWorks(categoryId, gallery) {
  gallery.innerHTML = '';

  for (let i = 0; i < apiDataWorks.length; i++) {
    createCard(apiDataWorks[i], categoryId, gallery);
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
  const user = JSON.parse(localStorage.getItem('user'));
  // await handleApiRequest(
  //   'works',
  //   'POST',
  //   {
  //     Authorization: `Bearer ${user.token}`,
  //   },
  //   {}
  // );
  if (!portfolioGallery) return;
  displayWorks(null, portfolioGallery);
  if (isAuth) return;
  displayButtons();
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
  const modal = document.querySelector('#overlay');
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
        displayWorks(null, modalImg.querySelector('.gallery'));
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
