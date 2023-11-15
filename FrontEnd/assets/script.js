const API = "http://localhost:5678/api/works";

async function fetchWorks() {
  const res = await fetch(API);
  const data = await res.json();

  return data;
}

async function displayWorks() {
  const API_dataWorks = await fetchWorks();

  for (let i = 0; i < API_dataWorks.length; i++) {
    let titleWork = API_dataWorks[i].title;
    let imgWork = API_dataWorks[i].imageUrl;

    let workDisplay = document.createElement("figure");
    let workImg = document.createElement("img");
    let workTitle = document.createElement("figcaption");

    workImg.src = imgWork;
    workImg.alt = titleWork;
    workTitle.textContent = titleWork;

    workDisplay.appendChild(workImg);
    workDisplay.appendChild(workTitle);

    let cards = document.querySelector(".gallery");
    cards.appendChild(workDisplay);
  }
}

displayWorks();
