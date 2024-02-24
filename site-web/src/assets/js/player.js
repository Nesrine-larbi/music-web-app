import * as utils from "./utils.js";

export default class Player {
  constructor () {
    this.audio = new Audio();
    this.currentIndex = 0;
    this.songsInPlayList = [];
    this.shuffle = false;
  }

  /**
   * Charge les chansons à jour et configure la première chanson comme source pour l'audio
   * @param {Object[]} songsInPlayList chansons à jouer
   */
  loadSongs (songsInPlayList) {
    songsInPlayList.forEach((element) => {
      const songToFind = "./assets/media/0" + (element.id + 1) + "_song.mp3";
      this.songsInPlayList.push({ id: element.id, src: songToFind });
    });
    this.currentIndex = songsInPlayList[0].id;
  }

  /**
   * Récupère une chanson à partir de son index et la retourne
   * @param {number} index index de la chanson
   * @returns une chanson en fonction de son index dans le tableau
   */
  getSongFromIndex (index) {
    let song;
    this.songsInPlayList.forEach((element) => {
      if (index === element.id) {
        song = element.src;
      }
    });
    return song;
  }

  /**
   * Joue une chanson en fonction de son index.
   * Si 'index' === -1, met l'audio et pause ou le joue si l'audio est déjà en pause
   * @param {number} index index de la chanson
   */
  playAudio (index = -1) {
    const timeRecord = this.audio.currentTime;
    if (index === -1 && !this.audio.paused) {
      this.audio.pause();
    } else {
      const srcBefore = this.audio.src
      this.currentIndex = index;
      this.audio.load();
      this.audio.src = this.getSongFromIndex(this.currentIndex);
      const resumeTime = this.audio.src === srcBefore ? timeRecord : 0;
      this.audio.currentTime = resumeTime;
      this.audio.play();
    }
  }

  /**
   * Incrémente l'index courant et joue la prochaine chanson avec le mouvel index.
   * Si la dernière chanson est présentement jouée, la première chanson de la liste devient la suivante
   * Si l'attribut 'shuffle' est true, l'index courant se fait assigner une valeur aléatoire valide
   */
  playPreviousSong () {
    let indexToIncrement = this.songsInPlayList.findIndex((object) => {
      return object.id === this.currentIndex;
    });
    if (this.shuffle) {
      const randomIndex = utils.random(0, this.songsInPlayList.length);
      this.playAudio((this.currentIndex = this.songsInPlayList[randomIndex].id));
    } else if (!this.shuffle) {
      const newIndex = utils.modulo(--indexToIncrement, this.songsInPlayList.length);
      this.playAudio((this.currentIndex = this.songsInPlayList[newIndex].id));
    }
  }

  /**
   * Décrémente l'index courant et joue la prochaine chanson avec le mouvel index.
   * Si la première chanson est présentement jouée, la dernière chanson de la liste devient la suivante
   * Si l'attribut 'shuffle' est true, l'index courant se fait assigner une valeur aléatoire valide
   */
  playNextSong () {
    let indexToIncrement = this.songsInPlayList.findIndex((object) => {
      return object.id === this.currentIndex;
    });
    if (this.shuffle) {
      const randomIndex = utils.random(0, this.songsInPlayList.length);
      this.playAudio((this.currentIndex = this.songsInPlayList[randomIndex].id));
    } else if (!this.shuffle) {
      const newIndex = utils.modulo(++indexToIncrement, this.songsInPlayList.length);
      this.playAudio((this.currentIndex = this.songsInPlayList[newIndex].id));
    }
  }

  /**
   * Modifie l'attribut 'currentTime' de l'attribut 'audio' pour modifier la place dans la chanson jouée
   * @param {number} timelineValue le pourcentage de la durée totale
   */
  audioSeek (timelineValue) {
    const time = (timelineValue * this.audio.duration) / 100;
    console.log(time)
    this.audio.currentTime = time;
  }

  /**
   * Change l'attribut 'volume' de l'attribut audio à 0 si le son est ouvert, à 1 sinon
   * @returns {boolean} true si le son est fermé, false sinon
   */
  muteToggle () {
    this.audio.volume = this.audio.muted ? 1 : 0;
    return this.audio.muted;
  }

  /**
   * Inverse la valeur de l'attribut 'shuffle'
   * @returns {boolean} la valeur de l'attribut 'shuffle'
   */
  shuffleToggle () {
    this.shuffle = !this.shuffle;
    return this.shuffle;
  }

  /**
   * Ajoute delta secondes à l'attribut 'currentTime' de l'attribut 'audio'
   * @param {number} delta le temps en secondes
   */
  scrubTime (delta) {
    this.audio.currentTime += delta;
  }

  /**
   * Retourne la chanson présentement jouée
   * @returns {Object} la chansons présentement jouée
   */
  get currentSong () {
    return this.songsInPlayList[this.currentIndex];
  }
}
