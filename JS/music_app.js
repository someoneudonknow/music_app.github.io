import {
  $,
  $$,
  songsHost,
  player,
  heading,
  cdThumb,
  audio,
  cd,
  playBtn,
  progess,
  nextBtn,
  prevBtn,
  volumeBtn,
  randomBtn,
  repeatBtn,
  playlist,
  volume,
  volumePercent,
  speaker,
  likeBtn,
  nameInput,
  singerInput,
  thumbLinkInput,
  musicFileInput,
  EditSongBtn,
  editSongForm,
  formTextInput,
  optionsBox,
  form,
  formHeader,
  saveBtn,
} from "./const.js";

import { song } from "./constructors.js";

var _app = (list) => {
  const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMuted: false,
    isEditable: false,
    isOptionsBoxOpened: false,
    currentVolume: 1,
    isInputed: function () {
      for (let i = 0; i < formTextInput.length; i++) {
        if (
          formTextInput[i].value === "" ||
          formTextInput[i].value === undefined
        ) {
          alert(
            `Please enter ${
              $('label[for="' + formTextInput[i].id + '"]').textContent
            }`
          );
          return false;
        }
      }

      if (musicFileInput.files.length <= 0) {
        alert("Please upload audio file!");
        return false;
      } else {
        musicFileInput.onchange = (e) => {
          if (this.files.length > 1) {
            alert("you can not upload more than one audio file!");
            e.preventDefault();
          }
        };
      }

      return true;
    },
    config: JSON.parse(window.localStorage.getItem("PLAYER_STORAGE_KEY")) || {},
    setConfig: function (key, value) {
      this.config[key] = value;
      window.localStorage.setItem(
        "PLAYER_STORAGE_KEY",
        JSON.stringify(this.config)
      );
    },
    songs: list,
    render: function () {
      const htmls = this.songs.map((song, index) => {
        return `<div data-index="${index}" class="song ${
          index === this.currentIndex ? "active" : ""
        }">
                                    <div class="thumb" style="background-image: url('${
                                      song.image
                                    }');"></div>
                                    <div class="body">
                                        <h3 class="title">${song.name}</h3>
                                        <p class="author">${song.singer}</p>
                                    </div>
                                    <div class="option-box"  song-id="${
                                      song.id
                                    }" song-index="${index}">
                                      <span id="delete">Delete</span>
                                      <span id="edit">Edit</span>
                                    </div>
                                    <div class="option">
                                      <i class="fas fa-ellipsis-h"></i>
                                    </div>
                            
                                    <p class="time"> <span class="min"></span>:<span class="seconds"></span></p>
                                </div>`;
      });

      playlist.innerHTML = htmls.join("\n");
      this.renderTime();
    },
    sortList: function () {
      let songsLength = this.songs.length;
      for (let i = 0; i < songsLength - 1; i++) {
        for (let j = i + 1; j < songsLength; j++) {
          if (this.songs[i].singer.localeCompare(this.songs[j].singer) === 1) {
            let temp = this.songs[i];
            this.songs[i] = this.songs[j];
            this.songs[j] = temp;
          }
        }
      }
    },
    renderTime: function () {
      const songList_m = $$(".song .time .min");
      const songList_s = $$(".song .time .seconds");
      const audioPaths = this.songs.map((song) => song.path);

      function getDuration(src, cb) {
        // takes a source audio file and a callback function
        var audio = new Audio();
        audio.addEventListener("loadedmetadata", () => {
          cb(audio.duration);
        });
        audio.src = src;
      }

      //render each song duration
      for (let i = 0; i < audioPaths.length; i++) {
        getDuration(audioPaths[i], (lenght) => {
          songList_m[i].textContent =
            Math.floor(lenght / 60) > 9
              ? Math.floor(lenght / 60)
              : "0" + Math.floor(lenght / 60);
          songList_s[i].textContent =
            Math.floor(lenght % 60) > 9
              ? Math.floor(lenght % 60)
              : "0" + Math.floor(lenght % 60);
        });
      }
    },
    defineProperties: function () {
      Object.defineProperty(this, "currentSong", {
        get: function () {
          return this.songs[this.currentIndex];
        },
      });
    },
    handleEvents: function () {
      const cdWidth = cd.offsetWidth;
      const _this = this;
      //handle cd sizing change
      player.onscroll = function () {
        const scrollTop = player.scrollY || player.scrollTop;
        let newCdWidth = cdWidth - scrollTop;
        cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
        cd.style.opacity = newCdWidth / cdWidth;
      };

      //handle CD rotation change
      const cdThumbAnimate = cdThumb.animate(
        [{ transform: "rotate(360deg)" }],
        {
          duration: 10000,
          iterations: Infinity,
        }
      );
      cdThumbAnimate.pause();

      //handle play btn
      playBtn.onclick = function () {
        if (_this.isPlaying) {
          audio.pause();
        } else {
          audio.play();
        }
      };

      // audio playing status
      audio.onplay = function () {
        cdThumbAnimate.play();
        _this.isPlaying = true;
        player.classList.add("playing");
      };

      // audio pause status
      audio.onpause = function () {
        cdThumbAnimate.pause();
        _this.isPlaying = false;
        player.classList.remove("playing");
      };

      //song progressPercents
      audio.ontimeupdate = function () {
        if (audio.duration) {
          const progressPercents = Math.floor(
            (audio.currentTime / audio.duration) * 100
          );
          progess.value = progressPercents;
        }
      };

      //fast forward progress bar
      progess.oninput = function (e) {
        audio.currentTime = Math.floor((e.target.value / 100) * audio.duration);
      };

      //next button
      nextBtn.onclick = function () {
        _this.isRandom ? _this.playRandomSong() : _this.nextSong();
        if (_this.isRepeat) {
          _this.isRepeat = false;
          repeatBtn.classList.remove("active");
        }
        audio.play();
        _this.scrollToActiveSong();
      };

      //prev button
      prevBtn.onclick = function () {
        _this.isRandom ? _this.playRandomSong() : _this.prevSong();
        if (_this.isRepeat) {
          _this.isRepeat = false;
          repeatBtn.classList.remove("active");
        }
        audio.play();
        _this.scrollToActiveSong();
      };

      //random button
      randomBtn.onclick = function (e) {
        if (_this.isRepeat) {
          _this.isRepeat = false;
          _this.setConfig("isRepeat", _this.isRepeat);
          repeatBtn.classList.remove("active");
        }
        _this.isRandom = !_this.isRandom;
        _this.setConfig("isRandom", _this.isRandom);
        this.classList.toggle("active", _this.isRandom);
      };

      //next/repeat/random song when audio is ended
      audio.onended = function () {
        if (_this.isRandom) {
          _this.playRandomSong();
          audio.play();
        } else if (_this.isRepeat) {
          audio.play();
        } else {
          _this.nextSong();
          audio.play();
        }
        _this.scrollToActiveSong();
      };

      //repeat button
      repeatBtn.onclick = function () {
        if (_this.isRandom) {
          _this.isRandom = false;
          _this.setConfig("isRandom", _this.isRandom);
          randomBtn.classList.remove("active");
        }
        _this.isRepeat = !_this.isRepeat;
        _this.setConfig("isRepeat", _this.isRepeat);
        this.classList.toggle("active", _this.isRepeat);
      };

      // listen to clicking events on playlists
      document.onclick = function () {
        if (_this.isOptionsBoxOpened) {
          _this.isOptionsBoxOpened = false;
          $(".song.show-options").classList.remove("show-options");
        }
      };

      playlist.onclick = function (e) {
        e.stopPropagation();
        const songNode = e.target.closest(".song:not(.active)");

        if (songNode || e.target.closest(".option")) {
          if (
            songNode &&
            !e.target.closest(".option") &&
            !e.target.closest(".option-box")
          ) {
            if (_this.isOptionsBoxOpened) {
              _this.isOptionsBoxOpened = false;
              $(".song.show-options").classList.remove("show-options");
            }
            _this.currentIndex = Number(songNode.dataset.index);
            _this.loadCurrentSong();
            _this.scrollToActiveSong();
            audio.play();
          }
          //handle when click to the option
          if (e.target.closest(".option")) {
            if (_this.isOptionsBoxOpened) {
              _this.isOptionsBoxOpened = false;
              $(".song.show-options").classList.remove("show-options");
              _this.isOptionsBoxOpened = !_this.isOptionsBoxOpened;
              e.target.parentElement.classList.toggle(
                "show-options",
                _this.isOptionsBoxOpened
              );
            } else {
              _this.isOptionsBoxOpened = !_this.isOptionsBoxOpened;
              e.target.parentElement.classList.toggle(
                "show-options",
                _this.isOptionsBoxOpened
              );
            }
          }
        }

        if (e.target.closest(".show-options .option-box #delete")) {
          if (confirm("Are you sure you want to delete this song ?")) {
            const thisSong = e.target.closest(".show-options .option-box");
            const songId = thisSong.getAttribute("song-id");
            _this.isOptionsBoxOpened = false;
            $(".song.show-options").classList.remove("show-options");
            _this.deleteSong(songId, function () {
              editSongForm.classList.remove("animation-play");
              location.reload();
            });
          }
        }

        if (e.target.closest(".show-options .option-box #edit")) {
          _this.isEditable = true;
          _this.isOptionsBoxOpened = false;
          form.classList.remove("create-form");
          formHeader.textContent = "Edit";

          const thisSong = e.target.closest(".show-options .option-box");
          const songId = thisSong.getAttribute("song-id");
          const songIndex = thisSong.getAttribute("song-index");

          $(".song.show-options").classList.remove("show-options");

          var thisSongName = _this.songs[songIndex].name;
          var thisSongSinger = _this.songs[songIndex].singer;
          var thisSongPath = _this.songs[songIndex].path;
          var thisSongImage = _this.songs[songIndex].image;

          nameInput.value = thisSongName;
          singerInput.value = thisSongSinger;
          thumbLinkInput.value = thisSongImage;

          saveBtn.onclick = function (e) {
            let data = new song(
              nameInput.value,
              singerInput.value,
              thisSongPath,
              thumbLinkInput.value
            );
            _this.editSong(data, songId, function () {
              _this.isEditable = false;
              let inputs = $$('input:not([type="range"])');

              for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = "";
              }

              form.classList.add("create-form");
              formHeader.textContent = "Create";
              editSongForm.classList.remove("animation-play");
              location.reload();
            });
          };
        }
      };

      //volume setting
      volume.oninput = function () {
        if (_this.isMuted) {
          audio.muted = false;
          _this.isMuted = false;
          speaker.classList.replace("fa-volume-xmark", "ti-volume");
        }
        _this.currentVolume = volume.value / 100;
        _this.setVolume();
      };

      volumeBtn.onclick = function (e) {
        if (!e.target.closest(".input-wrapper")) {
          _this.isMuted = !_this.isMuted;
          if (_this.isMuted) {
            speaker.classList.replace("ti-volume", "fa-volume-xmark");
            audio.muted = true;
            volume.value = 0;
            volumePercent.textContent = volume.value;
          } else {
            audio.muted = false;
            _this.setVolume();
          }
        }
      };

      likeBtn.onclick = function () {
        $(".btn-like i").classList.toggle("like");
      };

      player.onkeydown = (e) => {
        switch (e.keyCode) {
          case 32:
            e.preventDefault();
            playBtn.click();
            break;
          case 37:
            prevBtn.click();
            break;
          case 39:
            nextBtn.click();
            break;
          case 38:
            e.preventDefault();
            if (_this.isMuted) {
              audio.muted = false;
              _this.isMuted = false;
              speaker.classList.replace("fa-volume-xmark", "ti-volume");
            }
            volume.value = Number(volume.value) + 10;
            _this.currentVolume = Number(volume.value) / 100;
            _this.showVolume();
            _this.setVolume();
            break;
          case 40:
            e.preventDefault();
            if (_this.isMuted) {
              audio.muted = false;
              _this.isMuted = false;
              speaker.classList.replace("fa-volume-xmark", "ti-volume");
            }
            volume.value = Number(volume.value) - 10;
            _this.currentVolume = Number(volume.value) / 100;
            _this.showVolume();
            _this.setVolume();
            break;
          default:
            break;
        }
      };

      EditSongBtn.addEventListener("click", function () {
        if (_this.isInputed()) {
          if (!_this.isEditable) {
            editSongForm.classList.add("animation-play");

            let name = nameInput.value;
            let singer = singerInput.value;
            let thumbLink = thumbLinkInput.value;
            let filePath = "./assets/songs/" + musicFileInput.files[0].name;

            let data = new song(name, singer, filePath, thumbLink);

            _this.createSong(data, function () {
              let inputs = $$('input:not([type="range"])');
              for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = "";
              }
              editSongForm.classList.remove("animation-play");
              location.reload();
            });
          }
        }
      });
    },
    loadCurrentSong: function () {
      heading.textContent = this.currentSong.name;
      cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
      progess.value = 0;
      audio.src = this.currentSong.path;
      this.setConfig("currentIndex", this.currentIndex);
      this.render();
    },
    nextSong: function () {
      this.currentIndex++;
      if (this.currentIndex >= this.songs.length) {
        this.currentIndex = 0;
      }
      this.loadCurrentSong();
    },
    prevSong: function () {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1;
      }
      this.loadCurrentSong();
    },
    playRandomSong: function () {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * this.songs.length);
      } while (newIndex === this.currentIndex);
      this.currentIndex = newIndex;
      this.loadCurrentSong();
    },
    scrollToActiveSong: function () {
      setTimeout(() => {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 300);
    },
    setVolume: function () {
      if (this.currentVolume <= 0 && $(".ti-volume")) {
        speaker.classList.replace("ti-volume", "fa-volume-xmark");
      } else {
        speaker.classList.replace("fa-volume-xmark", "ti-volume");
      }
      audio.volume = this.currentVolume;
      volumePercent.textContent = Math.floor(this.currentVolume * 100);
      volume.value = volumePercent.textContent;
    },
    loadConfig: function () {
      this.isRandom = this.config.isRandom;
      this.isRepeat = this.config.isRepeat;
      this.currentIndex = this.config.currentIndex;
    },
    createSong: function (data, callback) {
      var options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data),
      };
      fetch(songsHost, options)
        .then((response) => response.json())
        .then(callback)
        .catch((error) => console.error(error));
    },
    deleteSong: function (id, callback) {
      editSongForm.classList.add("animation-play");
      var options = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      };

      fetch(songsHost + "/" + id, options)
        .then(function (response) {
          response.json();
        })
        .then(callback)
        .catch(function (err) {
          console.log(err);
        });
    },
    editSong: function (data, id, callback) {
      editSongForm.classList.add("animation-play");
      const options = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };

      fetch(songsHost + "/" + id, options)
        .then((response) => {
          response.json();
        })
        .then(callback)
        .catch((error) => console.log(error));
    },
    showVolume: function () {
      volumeBtn.classList.add("show-up");
      setTimeout(() => {
        volumeBtn.classList.remove("show-up");
      }, 600);
    },
    start: function () {
      this.loadConfig();

      //sort the song list by singer name
      this.sortList();

      //set start volume
      this.setVolume();

      //define current song property
      this.defineProperties();

      //listen and handle events
      this.handleEvents();

      //load the first song when the app start
      this.loadCurrentSong();

      //scroll to active song
      this.scrollToActiveSong();

      repeatBtn.classList.toggle("active", this.isRepeat);
      randomBtn.classList.toggle("active", this.isRandom);
    },
  };

  app.start();
};

export default _app;
