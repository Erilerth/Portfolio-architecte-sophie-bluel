const API = 'http://localhost:5678/api/works';

async function fetchWorks() {
  const res = await fetch(API);
  const data = await res.json();

  console.log(res, data);
  return data;
}

function displayWorks(data) {
  for (let i = 0; i < data.length; i++) {
    let titleWork = data[i].title;
    let imgWork = data[i].imageUrl;

    let workDisplay = document.createElement('figure');
    let workImg = document.createElement('img');
    let workTitle = document.createElement('figcaption');

    workImg.src = imgWork;
    workImg.alt = titleWork;
    workTitle.textContent = titleWork;

    workDisplay.appendChild(workImg);
    workDisplay.appendChild(workTitle);

    let cards = document.querySelector('.gallery');
    cards.appendChild(workDisplay);
  }
}

fetchWorks().then((data) => displayWorks(data));
