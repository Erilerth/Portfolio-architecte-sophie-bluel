const api = 'http://localhost:5678/api/';
let apiDataWorks = [];
let apiDataCategories = [];

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
  const cards = document.querySelector('.gallery');
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
  displayWorks();
  displayButtons();
}

init();
