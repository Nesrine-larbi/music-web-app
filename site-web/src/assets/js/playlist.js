import StorageManager from "./storageManager.js";
import { formatTime } from "./utils.js";
import { SKIP_TIME, SHORTCUTS } from "./consts.js";
import Player from "./player.js";

export class PlayListManager {
  constructor (player) {
    /**
     * @type {Player}
     */
    this.player = player;
    this.shortcuts = new Map();
  }

  /**
   * Charge les chansons de la playlist choisie et construit dynamiquement le HTML pour les éléments de chansons
   * @param {StorageManager} storageManager gestionnaire d'accès au LocalStorage
   * @param {string} playlistId identifiant de la playlist choisie
   */
  loadSongs (storageManager, playlistId) {
    const playlist = storageManager.getItemById(
      storageManager.STORAGE_KEY_PLAYLISTS,
      playlistId
    );
    if (!playlist) return;

    this.player.loadSongs(playlist.songs);
    const playlistImgElement = document.getElementById("playlist-img");
    playlistImgElement.src = playlist.thumbnail;
    const playlistTitleElement = document.getElementById("playlist-title");
    playlistTitleElement.textContent = playlist.name;

    const songContainerElement = document.getElementById("song-container");
    for (const songElement of playlist.songs) {
      const song = storageManager.getItemById(
        storageManager.STORAGE_KEY_SONGS,
        songElement.id
      );
      songContainerElement.append(this.buildSongItem(song, songElement.id));
    }
  }

  /**
   * Construit le code HTML pour représenter une chanson
   * @param {Object} song la chansons à représenter
   * @param {number} index index de la chanson
   * @returns {HTMLDivElement} le code HTML dans un élément <div>
   */
  buildSongItem (song, index) {
    const songItem = document.createElement("div");
    songItem.classList.add("song-item", "flex-row");
    const likedIconClass = "fa-heart fa-2x fa";
    const dislikedIconClass = "fa-heart fa-2x fa-regular";
    const indexElement = document.createElement("span");
    indexElement.textContent = index;
    const songNameElement = document.createElement("p");
    songNameElement.textContent = song.name;
    const songGenreElement = document.createElement("p");
    songGenreElement.textContent = song.genre;
    const songArtistElement = document.createElement("p");
    songArtistElement.textContent = song.artist;
    const songLikedElement = document.createElement("i");
    songLikedElement.classList = song.liked ? likedIconClass : dislikedIconClass;
    songItem.append(indexElement, songNameElement, songGenreElement, songArtistElement, songLikedElement);
    songItem.addEventListener(
      "click",
      () => {
        this.playAudio(index);
      },
      false
    );
    return songItem;
  }

  /**
   * Joue une chanson en fonction de l'index et met à jour le titre de la chanson jouée
   * @param {number} index index de la chanson
   */

  playAudio (index) {
    const soundPaused = this.player.audio.paused;
    !soundPaused ? this.player.playAudio(-1) : this.player.playAudio(index);
    this.setCurrentSongName();
    this.updatePlayButton();
  }

  updatePlayButton () {
    const playButton = document.getElementById("play");
    this.player.audio.paused
      ? playButton.classList.replace("fa-pause", "fa-play")
      : playButton.classList.replace("fa-play", "fa-pause");
  }

  /**
   * Joue la prochaine chanson et met à jour le titre de la chanson jouée
   */
  playPreviousSong () {
    this.player.playPreviousSong();
    this.setCurrentSongName();
    this.updatePlayButton();
  }

  /**
   * Joue la chanson précédente et met à jour le titre de la chanson jouée
   */
  playNextSong () {
    this.player.playNextSong();
    this.setCurrentSongName();
    this.updatePlayButton();
  }

  /**
   * Met à jour le titre de la chanson jouée dans l'interface
   */
  setCurrentSongName () {
    const infoSong = document.getElementById("now-playing");
    const songContainer = document.getElementById("song-container");
    Array.from(songContainer.childNodes).forEach((element) => {
      if (this.player.currentIndex === parseInt(element.textContent[0])) {
        infoSong.textContent = element.childNodes[1].textContent;
      }
    });
  }

  /**
   * Met à jour la barre de progrès de la musique
   * @param {HTMLSpanElement} currentTimeElement élément <span> du temps de la chanson
   * @param {HTMLInputElement} timelineElement élément <input> de la barre de progrès
   * @param {HTMLSpanElement} durationElement élément <span> de la durée de la chanson
   */
  timelineUpdate (currentTimeElement, timelineElement, durationElement) {
    const position =
      (100 * this.player.audio.currentTime) / this.player.audio.duration;
    timelineElement.value = position;
    currentTimeElement.textContent = formatTime(this.player.audio.currentTime);
    if (!isNaN(this.player.audio.duration)) {
      durationElement.textContent = formatTime(this.player.audio.duration);
    }
  }

  /**
   * Déplacement le progrès de la chansons en fonction de l'attribut 'value' de timeLineEvent
   * @param {HTMLInputElement} timelineElement élément <input> de la barre de progrès
   */
  audioSeek (timelineElement) {
    this.player.audioSeek((timelineElement.value))
  }

  /**
   * Active ou désactive le son
   * Met à jour l'icône du bouton et ajoute la classe 'fa-volume-mute' si le son ferme ou 'fa-volume-high' si le son est ouvert
   */
  muteToggle () {
    const muteToggleButton = document.getElementById("mute");
    this.player.muteToggle()
      ? muteToggleButton.classList.replace("fa-volume-mute", "fa-volume-high")
      : muteToggleButton.classList.replace("fa-volume-high", "fa-volume-mute");
    this.player.audio.muted = !this.player.muteToggle();
  }

  /**
   * Active ou désactive l'attribut 'shuffle' de l'attribut 'player'
   * Met à jour l'icône du bouton et ajoute la classe 'control-btn-toggled' si shuffle est activé, retire la classe sinon
   * @param {HTMLButtonElement} shuffleButton élément <button> de la fonctionnalité shuffle
   */
  shuffleToggle (shuffleButton) {
    this.player.shuffleToggle();
    this.player.shuffle
      ? shuffleButton.classList.add("control-btn-toggled")
      : shuffleButton.classList.remove("control-btn-toggled");
  }

  /**
   * Ajoute delta secondes au progrès de la chanson en cours
   * @param {number} delta temps en secondes
   */
  scrubTime (delta) {
    this.player.scrubTime(delta);
  }

  /**
   * Configure la gestion des événements
   */
  bindEvents () {
    const currentTime = document.getElementById("timeline-current");
    const duration = document.getElementById("timeline-end");
    const timeline = document.getElementById("timeline");
    const playButton = document.getElementById("play");
    const muteToggleButton = document.getElementById("mute");
    const nextButton = document.getElementById("next");
    const previousButton = document.getElementById("previous");
    const shuffleButton = document.getElementById("shuffle");
    this.player.audio.addEventListener("timeupdate", () => {
      this.timelineUpdate(currentTime, timeline, duration);
    });

    timeline.addEventListener("input", () => {
      this.audioSeek(timeline);
    });

    this.player.audio.addEventListener("ended", () => {
      this.playNextSong();
    });

    playButton.addEventListener("click", () => {
      this.playAudio(this.player.currentIndex);
    });

    muteToggleButton.addEventListener("click", () => {
      this.muteToggle();
    });

    previousButton.addEventListener("click", () => {
      this.playPreviousSong();
    });
    nextButton.addEventListener("click", () => {
      this.playNextSong();
    });
    shuffleButton.addEventListener("click", () => {
      this.shuffleToggle(shuffleButton);
    });
  }

  /**
   * Configure les raccourcis et la gestion de l'événement 'keydown'
   */
  bindShortcuts () {
    const songIndex = this.player.currentIndex;
    this.shortcuts.set(SHORTCUTS.GO_FORWARD, () => this.scrubTime(SKIP_TIME));
    this.shortcuts.set(SHORTCUTS.GO_BACK, () => this.scrubTime(-SKIP_TIME));
    this.shortcuts.set(SHORTCUTS.PLAY_PAUSE, () => this.playAudio(songIndex));
    this.shortcuts.set(SHORTCUTS.NEXT_SONG, () => this.playNextSong());
    this.shortcuts.set(SHORTCUTS.PREVIOUS_SONG, () => this.playPreviousSong());
    this.shortcuts.set(SHORTCUTS.MUTE, () => this.muteToggle());
    document.addEventListener("keydown", (event) => {
      if (this.shortcuts.has(event.key)) {
        const command = this.shortcuts.get(event.key);
        command();
      }
    });
  }
}

window.onload = () => {
  const storageManager = new StorageManager();
  storageManager.loadAllData();

  const urlParams = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  // Voir l'objet URLSearchParams
  const player = new Player();
  const playlistManager = new PlayListManager(player);

  playlistManager.bindEvents();
  playlistManager.bindShortcuts();

  playlistManager.loadSongs(storageManager, urlParams.id);
};
