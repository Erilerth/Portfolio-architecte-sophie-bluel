const api = 'http://localhost:5678/api/';
let apiDataWorks = [];
let apiDataCategories = [];

const cards = document.querySelector('.gallery');

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
  attribute = []
) {
  const elem = document.createElement(elt);
  if (className !== '') elem.className = className;
  if (text !== '') elem.innerText = text;
  if (id !== '') elem.id = id;
  attribute.forEach((attribute) => {
    elem.setAttribute(attribute.name, attribute.value);
  });
  return elem;
}

function createCard(currentWork, categoryId) {
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

    cards.appendChild(workDisplay);
  }
}

function displayWorks(categoryId) {
  cards.innerHTML = '';

  for (let i = 0; i < apiDataWorks.length; i++) {
    createCard(apiDataWorks[i], categoryId);
  }
}

function displayButtons() {
  const filterButton = document.querySelector('#filter');

  const allCategory = document.createElement('li');
  allCategory.innerText = 'Tous';
  allCategory.addEventListener('click', () => {
    displayWorks();
    toggleFilterSelected(allCategory);
  });

  filterButton.appendChild(allCategory).classList.add('filter-selected');

  for (let i = 0; i < apiDataCategories.length; i++) {
    const categoryId = apiDataCategories[i].id;
    const categoryName = apiDataCategories[i].name;

    const nameCategory = document.createElement('li');
    nameCategory.innerText = categoryName;
    nameCategory.addEventListener('click', () => {
      displayWorks(categoryId);
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
  if (cards) {
    displayWorks();
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
      if (validateFields(input) === false) {
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

    if (status === 'success') {
      if (errorMessage) {
        errorMessage.innerText = '';
      }

      field.classList.remove('input-error');
    }
    if (status === 'error') {
      errorMessage.innerText = message;
      field.classList.add('input-error');
    }
  }
}
