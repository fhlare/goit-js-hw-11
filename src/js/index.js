import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createImageCard } from './createMarkup.js';
import { getImage } from './fetch.js';
import { refs } from './refs.js';

let lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let page = 1;
let searchQuery = '';
const perPage = 40;
let data = {};

refs.form.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();

  searchQuery = e.target.elements.searchQuery.value.trim();
  if (!searchQuery) {
    return;
  }
  page = 1;
  refs.gallery.innerHTML = '';
  try {
    refs.loaderMore.classList.remove('visible');
    refs.loader.classList.add('visible');
    data = await getImage({ searchQuery, page, perPage });

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      refs.loaderMore.classList.remove('visible');
      return;
    }

    const totalHits = data.totalHits;
    const imagesHTML = data.hits.map(image => createImageCard(image)).join('');
    refs.gallery.innerHTML += imagesHTML;

    if (refs.gallery.children.length >= totalHits) {
      refs.loaderMore.classList.remove('visible');
      refs.gallery.innerHTML +=
        '<p class="end-results">We\'re sorry, but you\'ve reached the end of search results.</p>';
    } else {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      refs.loaderMore.classList.add('visible');
    }
  } catch (err) {
    console.error('Error fetching images:', err);
  } finally {
    lightbox.refresh();
    refs.loader.classList.remove('visible');
  }
}

refs.loaderMore.addEventListener('click', loadMore);

async function loadMore() {
  page += 1;
  try {
    refs.loaderMore.classList.remove('visible');
    refs.loader.classList.add('visible');
    data = await getImage({ searchQuery, page, perPage });

    const imagesHTML = data.hits.map(image => createImageCard(image)).join('');
    refs.gallery.innerHTML += imagesHTML;
  } catch (err) {
    console.error('Error fetching images:', err);
  } finally {
    lightbox.refresh();
    refs.loaderMore.classList.add('visible');
    refs.loader.classList.remove('visible');
  }
}
