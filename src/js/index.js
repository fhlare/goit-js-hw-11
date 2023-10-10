import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createImageCard } from './createMarkup.js';
import { getImage } from './fetch.js';
import { refs } from './refs.js';

let page = 1;
let searchQuery = '';
let lightbox = new SimpleLightbox('.gallery a');
const perPage = 40;

refs.loaderMore.classList.replace('load-more', 'load-more-hidden');

refs.form.addEventListener('submit', onSubmitForm);

async function onSubmitForm(e) {
  e.preventDefault();

  page = 1;
  searchQuery = e.target.elements.searchQuery.value.trim();
  refs.gallery.innerHTML = '';

  if (searchQuery === '') {
    refs.loaderMore.classList.replace('load-more', 'load-more-hidden');
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.',
      {
        position: 'right-top',
        timeout: 3000,
      }
    );
    return;
  }

  try {
    const response = await getImage(searchQuery, page, perPage);

    if (response.totalHits === 0) {
      refs.loaderMore.classList.replace('load-more', 'load-more-hidden');
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        {
          position: 'right-top',
          timeout: 3000,
        }
      );
    } else if (response.totalHits < 40) {
      refs.loaderMore.classList.replace('load-more', 'load-more-hidden');
      refs.gallery.insertAdjacentHTML(
        'beforeend',
        createImageCard(response.hits)
      );
      lightbox.refresh();
      Notiflix.Notify.success(
        `Hooray! We found ${response.totalHits} images.`,
        {
          position: 'right-top',
          timeout: 3000,
        }
      );
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results.",
        {
          position: 'right-top',
          timeout: 5000,
        }
      );
    } else {
      refs.gallery.insertAdjacentHTML(
        'beforeend',
        createImageCard(response.hits)
      );
      lightbox.refresh();
      Notiflix.Notify.success(
        `Hooray! We found ${response.totalHits} images.`,
        {
          position: 'right-top',
          timeout: 3000,
        }
      );

      refs.loaderMore.classList.replace('load-more-hidden', 'load-more');
    }
  } catch (error) {
    onGetImageError(error);
  } finally {
    refs.form.reset();
  }
}

refs.loaderMore.addEventListener('click', onLoadMoreClick);

async function onLoadMoreClick() {
  page += 1;

  try {
    const response = await getImage(searchQuery, page, perPage);

    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createImageCard(response.hits)
    );

    lightbox.refresh();

    const totalPages = Math.ceil(response.totalHits / perPage);

    if (page < totalPages) {
      refs.loaderMore.classList.replace('load-more-hidden', 'load-more');
    } else {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results.",
        {
          position: 'right-top',
          timeout: 5000,
        }
      );

      refs.loaderMore.classList.replace('load-more', 'load-more-hidden');
    }
  } catch (error) {
    onGetImageError(error);
  }
}

function onGetImageError(error) {
  console.error(error);

  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    {
      position: 'right-top',
      timeout: 3000,
    }
  );
}
