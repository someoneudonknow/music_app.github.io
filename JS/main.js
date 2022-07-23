import _app from './music_app.js';
import {songsHost} from './const.js'
import UiHandler from './UIHandler.js';

var getList = (callback) => {
  fetch(songsHost)
  .then(response => response.json())
  .then(callback)
  .catch(err => console.error(err))
}

getList(_app);
UiHandler();






