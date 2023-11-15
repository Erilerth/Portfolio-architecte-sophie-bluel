const API = 'http://localhost:5678/api/works';

async function fetchWorks() {
  const res = await fetch(API);
  const data = await res.json();

  return data;
}

async function displayWorks(categoryId = null) {
  const API_dataWorks = await fetchWorks();

  const filteredWorks = categoryId
    ? API_dataWorks.filter((work) => work.categoryId === categoryId)
    : API_dataWorks;

  const cards = document.querySelector('.gallery');
  cards.innerHTML = '';

  for (let i = 0; i < filteredWorks.length; i++) {
    let titleWork = filteredWorks[i].title;
    let imgWork = filteredWorks[i].imageUrl;

    let workDisplay = document.createElement('figure');
    let workImg = document.createElement('img');
    let workTitle = document.createElement('figcaption');

    workImg.src = imgWork;
    workImg.alt = titleWork;
    workTitle.textContent = titleWork;

    workDisplay.appendChild(workImg);
    workDisplay.appendChild(workTitle);

    cards.appendChild(workDisplay);
  }
}

document.getElementById('filter').addEventListener('click', handleFilterClick);

function handleFilterClick(event) {
  const target = event.target;

  if (target.tagName === 'LI') {
    const selectedCategory = target.textContent.toLowerCase();
    const categoryId = getCategoryId(selectedCategory);

    document.querySelectorAll('#filter li').forEach((li) => {
      li.classList.remove('filter-selected');
    });
    target.classList.add('filter-selected');

    displayWorks(categoryId);
  }
}

function getCategoryId(selectedCategory) {
  switch (selectedCategory) {
    case 'objets':
      return 1;
    case 'appartements':
      return 2;
    case 'hôtels & restaurants':
      return 3;
    default:
      return null;
  }
}

displayWorks();
