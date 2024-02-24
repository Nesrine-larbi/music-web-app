import StorageManager from "./storageManager.js";

class Library {
  constructor (storageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Génère le code HTML pour l'affichage des playlists et chansons disponibles
   * @param {Object[]} playlists liste de playlists à afficher
   * @param {Object[]} songs liste de chansons à afficher
   */
  generateLists (playlists, songs) {
    const playlistContainer = document.getElementById("playlist-container");
    const songContainer = document.getElementById("song-container");
    playlistContainer.innerHTML = ""; // vider la liste
    for (const playlist of playlists) {
      playlistContainer.appendChild(this.buildPlaylistItem(playlist));
    }
    for (const songElement of songs) {
      songContainer.appendChild(this.buildSongItem(songElement));
    }
  }

  /**
   * Construit le code HTML qui représente l'affichage d'une playlist
   * @param {Object} playlist playlist à utiliser pour la génération du HTML
   * @returns {HTMLAnchorElement} élément <a> qui contient le HTML de l'affichage pour une playlist
   */
  buildPlaylistItem (playlist) {
    const playlistItem = document.createElement("a");
    playlistItem.className = "playlist-item flex-column";
    playlistItem.setAttribute(
      "href",
      "./playlist.html?id=".concat(playlist.id)
    );
    const nameElement = document.createElement("p");
    nameElement.textContent = playlist.name;
    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = playlist.description;
    const divElement = document.createElement("div");
    divElement.className = "playlist-preview";
    const imgElement = document.createElement("img");
    imgElement.src = playlist.thumbnail;
    const iconElement = document.createElement("i");
    iconElement.className = "fa fa-2x fa-play-circle hidden playlist-play-icon";
    divElement.append(imgElement, iconElement);
    playlistItem.append(divElement, nameElement, descriptionElement);
    return playlistItem;
  }

  /**
   * Construit le code HTML qui représente l'affichage d'une chansons
   * @param {Object} song chanson à utiliser pour la génération du HTML
   * @returns {HTMLDivElement} élément <div> qui contient le HTML de l'affichage pour une chanson
   */
  buildSongItem = function (song) {
    const likedIconClass = "fa-heart fa-2x fa";
    const dislikedIconClass = "fa-heart fa-2x fa-regular";
    const songItem = document.createElement("div");
    songItem.className = "song-item flex-row";
    const nameItem = document.createElement("p");
    nameItem.textContent = song.name;
    const artistItem = document.createElement("p");
    artistItem.textContent = song.artist;
    const genreItem = document.createElement("p");
    genreItem.textContent = song.genre;
    const buttonItem = document.createElement("button");
    buttonItem.classList = song.liked ? likedIconClass : dislikedIconClass;
    songItem.append(nameItem, genreItem, artistItem, buttonItem);

    buttonItem.addEventListener(
      "click",
      () => {
        buttonItem.className = buttonItem.className.match("fa-regular")
          ? likedIconClass
          : dislikedIconClass;
        song.liked = !song.liked;
        this.storageManager.replaceItem(
          this.storageManager.STORAGE_KEY_SONGS,
          song
        );
      },
      false
    );

    return songItem;
  };
}

window.onload = () => {
  const storageManager = new StorageManager();
  const library = new Library(storageManager);

  storageManager.loadAllData();
  const playlist = storageManager.getData(storageManager.STORAGE_KEY_PLAYLISTS);
  const songs = storageManager.getData(storageManager.STORAGE_KEY_SONGS);
  library.generateLists(playlist, songs);
};
