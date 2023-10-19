document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = 'AIzaSyA-gnRbgX7oPYTlwcJm0o5jrko0LEysot8';
  const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
  const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
  const videolistitems = document.querySelector('.video-list__items');

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

  const formatDuration = (durtion) => {
    let str = durtion.slice(2, durtion.length);
    str = str.replace("H", "ч. ");
    str = str.replace("M", "мин. ");
    str = str.replace("S", "сек.");
    return str;
  }

  const displayVideo = (videos) => {
    videolistitems.textContent = "";
    const listVideos = videos.items.map((video) => {
      // console.log(video);
      const li = document.createElement('li');
      li.classList.add('video-list__item')
      li.innerHTML = `
				<artical class="video-card">
						<a href="/video.html?id=${video.id}" class="video-card__link">
							<div class="video-card__thumbnail">
								<img src="${video.snippet.thumbnails.standard?.url || video.snippet.thumbnails.high?.url}" alt="${video.snippet.title}" class="video-card__thumbnail-img">
							</div>
							<h3 class="video-card__title">${video.snippet.title}</h3>
							<p class="video-card__channel">${video.snippet.channelTitle}</p>
							<p class="video-card__duration">${formatDuration(video.contentDetails.duration)}</p>
						</a>
						<button class="video-card__favorite" type="button" area-label="Добавить в избранное, ${video.snippet.title}">
							<svg class="search__ico" width="20" height="20" role="img" area-label="Добавить в избранное">
								<use class="star-o" xlink:href="./images/sprite.svg#star-ob"></use>
								<use class="star" xlink:href="./images/sprite.svg#star"></use>
							</svg>
						</button>
					</artical>
			`;
      return li;
    });

    videolistitems.append(...listVideos);

  }

  fetchTrandingVideos().then(displayVideo)

})