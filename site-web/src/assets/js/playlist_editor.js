import StorageManager from "./storageManager.js";
import { generateRandomID } from "./utils.js";
let COUNT = 1;
/**
 * Popule l'élément 'dataList' avec des éléments <option> en fonction des noms des chansons en paramètre
 * @param {HTMLDataListElement} dataList élément HTML à qui ajouter des options
 * @param {Object} songs liste de chansons dont l'attribut 'name' est utilisé pour générer les éléments <option>
 */
function buildDataList (dataList, songs) {
  dataList.innerHTML = "";
  songs.forEach((songElement) => {
    const optionElement = document.createElement("option");
    optionElement.value = songElement.name;
    dataList.appendChild(optionElement);
  });
}

/**
 * Permet de mettre à jour la prévisualisation de l'image pour la playlist
 */
function updateImageDisplay () {
  const imagePreview = document.getElementById("image-preview");
  imagePreview.src = URL.createObjectURL(this.files[0]);
}

/**
 * Ajoute le code HTML pour pouvoir ajouter une chanson à la playlist
 * Le code contient les éléments <label>, <input> et <button> dans un parent <div>
 * Le bouton gère l'événement "click" et retire le <div> généré de son parent
 * @param {Event} e événement de clic
 */
function addItemSelect (e) {
  e.preventDefault();
  const songContainer = document.getElementById("song-list");
  const songContainerDiv = document.createElement("div");
  const labelElement = document.createElement("label");
  const songContainerinput = document.createElement("input");
  const minusButtonElement = document.createElement("button");
  labelElement.setAttribute("for", "song-" + COUNT);
  labelElement.textContent = "#" + COUNT + " ";
  songContainerinput.setAttribute("class", "song-input");
  songContainerinput.setAttribute("id", "song-" + COUNT);
  songContainerinput.setAttribute("type", "select");
  songContainerinput.setAttribute("list", "song-dataList");
  songContainerinput.setAttribute("required", "true");
  minusButtonElement.setAttribute("class", "fa fa-minus");
  songContainerDiv.append(labelElement, songContainerinput);
  songContainer.append(minusButtonElement, songContainerDiv);
  minusButtonElement.addEventListener("click", (e) => {
    e.preventDefault();
    let currentDiv = e.target.nextElementSibling;
    while (currentDiv) {
      if (currentDiv.firstElementChild) {
        const targetId = parseInt(currentDiv.firstElementChild.textContent.slice(1))
        currentDiv.firstElementChild.setAttribute("for", "song-" + (targetId - 1));
        currentDiv.firstElementChild.textContent = "#" + (targetId - 1) + " ";
        currentDiv.lastElementChild.setAttribute("id", "song-" + (targetId - 1));
      }
      currentDiv = currentDiv.nextElementSibling;
    }
    e.target.nextSibling.remove();
    e.target.remove();
    COUNT--;
  });
}

/**
 * Génère un objet Playlist avec les informations du formulaire et le sauvegarde dans le LocalStorage
 * @param {HTMLFormElement} form élément <form> à traiter pour obtenir les données
 * @param {StorageManager} storageManager permet la sauvegarde dans LocalStorage
 */
async function createPlaylist (form, storageManager) {
  // Voir la propriété "elements" https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements
  const elements = form.elements;
  const newPlaylist = {
    id: generateRandomID(2),
    name: elements.name.value,
    description: elements.description.value,
    thumbnail: await getImageInput(elements.image),
    songs: [],
  };
  let i = 1;
  Array.from(elements).forEach((element) => {
    if (element.id === "song-" + i) {
      const id = storageManager.getIdFromName(storageManager.STORAGE_KEY_SONGS, element.value)
      newPlaylist.songs.push({ id: parseInt(id) });
      ++i;
    }
  });
  storageManager.addItem(storageManager.STORAGE_KEY_PLAYLISTS, newPlaylist);
}

/**
 * Fonction qui permet d'extraire une image à partir d'un file input
 * @param {HTMLInputElement} input champ de saisie pour l'image
 * @returns image récupérée de la saisie
 */
async function getImageInput (input) {
  if (input && input.files && input.files[0]) {
    const image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(reader.result);
      reader.readAsDataURL(input.files[0]);
    });
    return image;
  }
}

window.onload = () => {
  const imageInput = document.getElementById("image");
  const form = document.getElementById("playlist-form");
  const dataListElement = document.getElementById("song-dataList");
  const buttonAdd = document.getElementById("add-song-btn");
  const indexhref = document
    .getElementsByClassName("fa-music")[0]
    .parentElement.getAttribute("href");
  const storageManager = new StorageManager();
  storageManager.loadAllData();
  const songs = storageManager.getData(storageManager.STORAGE_KEY_SONGS);

  buildDataList(dataListElement, songs);
  imageInput.addEventListener("change", updateImageDisplay);
  buttonAdd.addEventListener(
    "click",
    (e) => {
      ++COUNT;
      addItemSelect(e);
    },
    false
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    createPlaylist(form, storageManager);
    window.location.replace(indexhref);
  });
};
