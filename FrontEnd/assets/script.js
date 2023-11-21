const api = 'http://localhost:5678/api/';
let apiDataWorks = [];
let apiDataCategories = [];

const cards = document.querySelector('.gallery');

async function fetchData() {
  apiDataWorks = await fetchApi('works');
  apiDataCategories = await fetchApi('categories');
}

async function fetchApi(endPoint) {
  const endPointName = endPoint;
  const res = await fetch(api + endPointName);
  const data = await res.json();

  return data;
}

function displayWorks(categoryId) {
  cards.innerHTML = '';

  for (let i = 0; i < apiDataWorks.length; i++) {
    const currentWork = apiDataWorks[i];

    if (!categoryId || currentWork.categoryId === categoryId) {
      const titleWork = currentWork.title;
      const imgWork = currentWork.imageUrl;

      const workDisplay = document.createElement('figure');
      const workImg = document.createElement('img');
      const workTitle = document.createElement('figcaption');

      workImg.src = imgWork;
      workImg.alt = titleWork;
      workTitle.textContent = titleWork;

      workDisplay.appendChild(workImg);
      workDisplay.appendChild(workTitle);

      cards.appendChild(workDisplay);
    }
  }
}

function displayButtons() {
  const filterButtons = document.querySelector('#filter');

  const allCategory = document.createElement('li');
  allCategory.innerText = 'Tous';
  allCategory.addEventListener('click', () => {
    displayWorks();
    toggleFilterSelected(allCategory);
  });

  filterButtons.appendChild(allCategory).classList.add('filter-selected');

  for (let i = 0; i < apiDataCategories.length; i++) {
    const categoryId = apiDataCategories[i].id;
    const categoryName = apiDataCategories[i].name;

    const nameCategory = document.createElement('li');
    nameCategory.innerText = categoryName;
    nameCategory.addEventListener('click', () => {
      displayWorks(categoryId);
      toggleFilterSelected(nameCategory);
    });

    filterButtons.appendChild(nameCategory);
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

class login {
  constructor(form, fields) {
    this.form = form;
    this.fields = fields;
    this.validateOnSubmit();
  }

  validateOnSubmit() {
    let self = this;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      var error = 0;

      self.fields.forEach((field) => {
        const input = document.querySelector(`#${field}`);
        if (self.validateFields(input) == false) {
          error++;
        }
      });
      if (error == 0) {
        localStorage.setItem('auth', 1);
        this.form.submit();
      }
    });
  }

  validateFields(field) {
    if (field.value.trim() == '') {
      this.setStatus(
        field,
        `${field.previousElementSibling.innerText} ne peut pas être vide`,
        'error'
      );
      return false;
    } else {
      this.setStatus(field, null, 'success');
      return true;
    }
  }

  setStatus(field, message, status) {
    const errorMessage = field.nextElementSibling;

    if (status == 'success') {
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

const form = document.querySelector('.login_form');
if (form) {
  const fields = ['E-mail', 'password'];
  const validator = new login(form, fields);
}
