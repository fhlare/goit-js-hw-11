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

function onSubmitForm(e) {
  e.preventDefault();

  page = 1;
  searchQuery = e.target.elements.searchQuery.value.trim();
  refs.gallery.innerHTML = '';

  if (searchQuery === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.',
      {
        position: 'right-top',
        timeout: 3000,
      }
    );
    return;
  }

  getImage(searchQuery, page, perPage)
    .then(response => {
      if (response.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          {
            position: 'right-top',
            timeout: 3000,
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
    })
    .catch(onGetImageError)
    .finally(() => {
      refs.form.reset();
    });
}

refs.loaderMore.addEventListener('click', onLoadMoreClick);

function onLoadMoreClick() {
  page += 1;

  getImage(searchQuery, page, perPage)
    .then(response => {
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
    })
    .catch(onGetImageError);
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


