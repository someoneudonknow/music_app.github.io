export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);

export const songsHost = 'http://localhost:3000/songs';

export const player = $(".player");
export const heading = $("header h2");
export const cdThumb = $(".cd-thumb");
export const audio = $("#audio");
export const cd = $(".cd");
export const playBtn = $(".btn-toggle-play");
export const progess = $("#progress");
export const nextBtn = $(".btn-next");
export const prevBtn = $(".btn-prev");
export const volumeBtn = $(".btn-volume");
export const randomBtn = $(".btn-random");
export const repeatBtn = $(".btn-repeat");
export const playlist = $(".playlist");
export const volume = $("#volume");
export const volumePercent = $("#volume-percent");
export const speaker = $(".btn-volume i");
export const likeBtn = $(".btn-like");
export const nameInput = $('#song-name');
export const singerInput = $('#singer-name');
export const thumbLinkInput = $('#thumb-link');
export const musicFileInput = $('#music-file');
export const EditSongBtn = $('.create-btn');
export const editSongForm = $('.edit-song');
export const formTextInput = $$('input[name="form-inputs"]:not([type="file"])');
export const line = $('.line');
export const optionsBox = $$('.option-box');
export const form = $('.edit-form');
export const formHeader = $('.form-header');
export const saveBtn = $('.save-btn');