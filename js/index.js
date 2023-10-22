document.addEventListener('DOMContentLoaded', () => {
	const API_KEY = 'AIzaSyA-gnRbgX7oPYTlwcJm0o5jrko0LEysot8';
	const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
	const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

	const router = new Navigo('/', { hash: true });

	const main = document.querySelector('main');


	const favoriteIds = JSON.parse(localStorage.getItem('favoriteYT') || "[]")

	const preload = {
		elem: document.createElement('div'),
		text: '<p class="preload__text">Загрузка...</p>',
		append() {
			main.append(this.elem)
		},
		remove() {
			this.elem.remove();
		},
		init() {
			this.elem.classList.add('preload');
			this.elem.innerHTML = this.text;
		}
	}
	preload.init();

	// const videolistitems = document.querySelector('.video-list__items');

	const fetchTrandingVideos = async () => {
		try {
			const url = new URL(VIDEOS_URL);
			url.searchParams.append('part', 'contentDetails,id,snippet')
			url.searchParams.append('chart', 'mostPopular')
			url.searchParams.append('regionCode', 'RU')
			url.searchParams.append('maxResults', '12')
			url.searchParams.append('key', API_KEY)
			const respons = await fetch(url)
			if (!respons.ok) {
				throw new Error(`HTTP error ${respons.status}`)
			}

			return await respons.json()
		} catch (error) {
			console.log(error);
		}
	}

	const fetchFavoriteVideos = async () => {
		try {
			if (favoriteIds.length === 0) {
				return { items: [] };
			}

			const url = new URL(VIDEOS_URL);

			url.searchParams.append('part', 'contentDetails,id,snippet')
			url.searchParams.append('maxResults', '12')
			url.searchParams.append('id', favoriteIds.join(","));
			url.searchParams.append('key', API_KEY)
			const respons = await fetch(url)
			if (!respons.ok) {
				throw new Error(`HTTP error ${respons.status}`)
			}

			return await respons.json()
		} catch (error) {
			console.log(error);
		}
	}


	const fetchVideoData = async (id) => {
		try {
			const url = new URL(VIDEOS_URL);

			url.searchParams.append('part', 'id,snippet,statistics')
			url.searchParams.append('id', id);
			url.searchParams.append('key', API_KEY)
			const respons = await fetch(url)
			if (!respons.ok) {
				throw new Error(`HTTP error ${respons.status}`)
			}

			return await respons.json()
		} catch (error) {
			console.log(error);
		}
	}

	// const formatDuration = (durtion) => {
	//   let str = durtion.slice(2, durtion.length);
	//   str = str.replace("H", " ч. ");
	//   str = str.replace("M", " мин. ");
	//   str = str.replace("S", " сек.");
	//   return str;
	// }

	const convertISOToReadbleDuration = (isoDuration) => {
		const hoursmatch = isoDuration.match(/(\d+)H/)
		const minutesmatch = isoDuration.match(/(\d+)M/)
		const secondsmatch = isoDuration.match(/(\d+)S/)

		const hours = hoursmatch ? parseInt(hoursmatch[1]) : 0;
		const minutes = minutesmatch ? parseInt(minutesmatch[1]) : 0;
		const seconds = secondsmatch ? parseInt(secondsmatch[1]) : 0;
		let result = '';

		if (hours > 0) {
			result += `${hours} ч `;
		}
		if (minutes > 0) {
			result += `${minutes} мин `;
		}
		if (seconds > 0) {
			result += `${seconds} сек `;
		}
		return result.trim();
	};

	const formatDate = (isoString) => {
		const date = new Date(isoString);
		const formatter = new Intl.DateTimeFormat("ru-RU", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
		return formatter.format(date);
	}

	const createListVideo = (videos, titleText, pagination) => {
		const videoListSection = document.createElement('section');
		videoListSection.classList.add('video-list');

		const container = document.createElement('div');
		container.classList.add('container');

		const title = document.createElement('h2');
		title.classList.add('video-list__title');
		title.textContent = titleText;

		const videoListItems = document.createElement('ul');
		videoListItems.classList.add('video-list__items');

		const listVideos = videos.items.map((video) => {
			// console.log(video);
			const li = document.createElement('li');
			li.classList.add('video-list__item')
			li.innerHTML = `
				<artical class="video-card">
						<a href="#/video/${video.id}" class="video-card__link">
							<div class="video-card__thumbnail">
								<img src="${video.snippet.thumbnails.standard?.url || video.snippet.thumbnails.high?.url}" alt="${video.snippet.title}" class="video-card__thumbnail-img">
							</div>
							<h3 class="video-card__title">${video.snippet.title}</h3>
							<p class="video-card__channel">${video.snippet.channelTitle}</p>
							<p class="video-card__duration">${convertISOToReadbleDuration(video.contentDetails.duration)}</p>
						</a>
						<button class="video-card__favorite favorite ${favoriteIds.includes(video.id) ? 'active' : ""}" type="button" area-label="Добавить в избранное, ${video.snippet.title}"
						data-video-id="${video.id}">
							<svg class="search__ico" width="20" height="20" role="img" area-label="Добавить в избранное">
								<use class="star-o" xlink:href="./images/sprite.svg#star-ob"></use>
								<use class="star" xlink:href="./images/sprite.svg#star"></use>
							</svg>
						</button>
					</artical>
			`;
			return li;
		});
		if (!pagination) {
			// TODO: pagination
			console.log("pagination");
		}
		videoListSection.append(container);
		container.append(videoListItems);
		videoListItems.append(...listVideos);
		return videoListSection;
	}

	const createVideo = (video) => {
		const videoSection = document.createElement('section');
		videoSection.classList.add('video')
		videoSection.innerHTML = `
				<div class="container">
					<div class="video__player">
						<iframe class="video__iframe" width="560" height="315" src="https://www.youtube.com/embed/${video.id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
					</div>
					<div class="video__container">
						<div class="video__content">
							<h2 class="video__title">${video.snippet.title}</h2>
							<p class="video__channel">${video.snippet.channelTitle}</p>
							<p class="video__info">
								<span class="video__views">${parseInt(video.statistics.viewCount).toLocaleString()} просмотров</span>
								<span class="video__date">Дата премьеры: ${formatDate(video.snippet.publishedAt)}</span>
							</p>
							<p class="video__description">${video.snippet.description}</p>
						</div>
						<!-- video__link_active -->
						<button class="video__link favorite ${favoriteIds.includes(video.id) ? 'active' : ""}" data-video-id="${video.id}">
							<span class="video__no-favorite">Избранное</span>
							<span class="video__favorite">В избранном</span>
							<svg class="video__icon" width="20" height="20" role="img" area-label="В избранном">
								<!-- <use xlink:href="./images/sprite.svg#star"></use> -->
								<use class="star-o" xlink:href="./images/sprite.svg#star-ob"></use>
								<use class="star" xlink:href="./images/sprite.svg#star"></use>
							</svg>
						</button>
					</div>
				</div>
		`;
		return videoSection;
	}

	const createHero = () => {
		const heroSection = document.createElement('section');
		heroSection.classList.add('hero');
		heroSection.innerHTML = `
			<div class="container">
				<div class="hero__container">
					<a href="#/favorite" class="hero__link">
						<span>Избранное</span>
						<svg class="hero__icon" width="20" height="20" role="img" area-label="Избранное">
							<use xlink:href="./images/sprite.svg#star-ow"></use>
						</svg>
					</a>
					<svg class="hero__logo" width="240" height="32" role="img" area-label="Logo">
						<use xlink:href="./images/sprite.svg#logo-white"></use>
					</svg>
					<h1 class="hero__title">Смотри. Загружай. Создавай</h1>
					<p class="hero__tegline">Удобный видеохостинг для тебя</p>
				</div>
			</div>
		`;
		return heroSection;
	};

	const createSearch = () => {
		const searchSection = document.createElement('section');
		searchSection.classList.add('search');
		const container = document.createElement('div');
		container.classList.add('container');
		// const title = document.createElement('h2');
		// title.classList.add('visualy-hidden');
		const form = document.createElement('form');
		form.classList.add('search__form');

		searchSection.append(container);
		container.append(form);
		form.innerHTML = `
			<input class="search__input" type="search" name="search" placeholder="Найти видео... ">
				<button class="search__btn" type="submit">
					<span>Поиск</span>
					<svg class="video-card__ico" width="20" height="20" role="img" area-label="Поиск">
						<use xlink:href="./images/sprite.svg#search"></use>
					</svg>
				</button>
		`;
		return searchSection;
	}

	const indexRoute = async () => {
		main.innerHTML = '';
		preload.append();
		const hero = createHero();
		const search = createSearch();
		const videos = await fetchTrandingVideos();
		preload.remove();
		const listVideo = createListVideo(videos);
		main.append(hero, search, listVideo);
	};
	const videoRoute = async (ctx) => {
		console.log(ctx)
		const id = ctx.data.id;
		main.textContent = '';
		preload.append();
		const search = createSearch();
		const data = await fetchVideoData(id);
		const video = data.items[0];
		preload.remove();
		const videoSection = createVideo(video);
		main.append(search, videoSection);
	};
	const favoriteRoute = () => {
		console.log('favorite')
	};
	const searchRoute = () => {
		console.log('search')

	};

	const init = () => {
		router.on({
			'/': indexRoute,
			'/video/:id': videoRoute,
			'/favorite': favoriteRoute,
			'/search': searchRoute,
		}).resolve();


		// const currentPage = location.pathname.split("/").pop(); // пулучаем текущую страницу
		// const urlSearchParams = new URLSearchParams(location.search);
		// const videoId = urlSearchParams.get('id'); // получаем id из GET параметров
		// const searchQuery = urlSearchParams.get('q'); // получаем query из GET параметров

		// if (currentPage === "index.html" || currentPage === "") {
		// 	fetchTrandingVideos().then(displayListVideo)
		// } else if (currentPage === "video.html" && videoId) {
		// 	fetchVideoData(videoId).then(displayVideo)
		// 	fetchTrandingVideos().then(displayListVideo)
		// 	console.log(videoId);
		// } else if (currentPage === "favorite.html") {
		// 	fetchFavoriteVideos().then(displayListVideo)
		// } else if (currentPage === "search.html" && searchQuery) {
		// 	console.log(currentPage);
		// }

		// console.log(videoId)

		document.body.addEventListener('click', ({ target }) => {
			const itemFavorite = target.closest('.favorite')

			if (itemFavorite) {
				const videoId = itemFavorite.dataset.videoId;
				if (favoriteIds.includes(videoId)) {
					favoriteIds.splice(favoriteIds.indexOf(videoId), 1);
					localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds))
					itemFavorite.classList.remove('active');
				} else {
					favoriteIds.push(videoId);
					localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds))
					itemFavorite.classList.add('active');
					// console.log(favoriteIds);
				}
			}
		})
	}
	init();
})