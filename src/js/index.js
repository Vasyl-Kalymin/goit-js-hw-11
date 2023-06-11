import Axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

form.addEventListener('submit', onSubmitBtn);
btnLoadMore.addEventListener('click', onLoadMoreBtn);

const limit = 40;
let pageToFetch = 1;
let queryToFetch = '';

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

async function fetchItems() {
  try {
    const { data } = await Axios('https://pixabay.com/api/', {
      params: {
        key: '37181926-6033a8d8e2e79819dc5d9f6a2',
        q: queryToFetch,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: limit,
        page: pageToFetch,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

function createGalleryItem(items) {
  const markup = items.hits
    .map(
      item => `
     <a class="gallery-link" href="${item.largeImageURL}">
  <div class="photo-card">
  <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes </b> ${item.likes}
    </p>
    <p class="info-item">
      <b>Views </b> ${item.views}
    </p>
    <p class="info-item">
      <b>Comments </b> ${item.comments}
    </p>
    <p class="info-item">
      <b>Downloads </b> ${item.downloads}
    </p>
  </div>
</div>
</a>
  `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
};

async function getEvents() {
  const res = await fetchItems();

  if (!res.totalHits) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    btnLoadMore.classList.add('invisible');
    return;
  };

  if (res.totalHits <= pageToFetch * limit) {
    btnLoadMore.classList.add('invisible');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    btnLoadMore.classList.remove('invisible');
  };

  createGalleryItem(res);
  lightbox.refresh();

  if (pageToFetch === 1) {
    Notiflix.Notify.success(`"Hooray! We found ${res.totalHits} images."`);
  };
};

function onSubmitBtn(evt) {
  evt.preventDefault();
  queryToFetch = evt.target.elements.searchQuery.value.trim();
  gallery.innerHTML = '';
  pageToFetch = 1;

  if (queryToFetch.trim() === '') {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

     btnLoadMore.classList.add('invisible');
    return;
  }
  btnLoadMore.classList.add('invisible');
  getEvents();
  form.reset();
};

function onLoadMoreBtn() {
  pageToFetch += 1;
  getEvents();
  lightbox.refresh();
};
