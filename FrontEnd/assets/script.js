const API = 'http://localhost:5678/api/works';

async function fetchWorks() {
  const res = await fetch(API);
  const data = await res.json();

  return data;
}

async function displayWorks() {
  const apiDataWorks = await fetchWorks();

  for (let i = 0; i < apiDataWorks.length; i++) {
    const titleWork = apiDataWorks[i].title;
    const imgWork = apiDataWorks[i].imageUrl;

    const workDisplay = document.createElement('figure');
    const workImg = document.createElement('img');
    const workTitle = document.createElement('figcaption');

    workImg.src = imgWork;
    workImg.alt = titleWork;
    workTitle.textContent = titleWork;

    workDisplay.appendChild(workImg);
    workDisplay.appendChild(workTitle);

    const cards = document.querySelector('.gallery');
    cards.appendChild(workDisplay);
  }
}

displayWorks();
