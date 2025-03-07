let audioPlayer = new Audio();

async function getSongs() {
    let file = await fetch("http://127.0.0.1:3000/Spotify_Project/Live Preview/Songs/");
    let text = await file.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName('a');
    let songs = [];

    for (let i = 0; i < links.length; i++) {
        const element = links[i];
        if (element.href.endsWith('mp3'))
            songs.push(element.href);
    }

    return songs
}

async function infoExtract(song) {
    return new Promise((resolve, reject) => {
        jsmediatags.read(song, {
            onSuccess: function (tag) {
                const data = tag.tags.picture ? tag.tags.picture.data : [];
                const format = tag.tags.picture ? tag.tags.picture.format : "";

                let base64string = "";
                for (let i = 0; i < data.length; i++)
                    base64string += String.fromCharCode(data[i]);

                const url = `url(data:${format};base64,${window.btoa(base64string)})`;
                const name = tag.tags.title || "Unknown Title";
                const artist = tag.tags.artist || "Unknown Artist";

                resolve([name, artist, url]);
            },
            onError: function (error) {
                reject(error);
            }
        });
    });
}

async function getFolders() {
    let file = await fetch("http://127.0.0.1:3000/Spotify_Project/Live Preview/Popular Artist/");
    let text = await file.text();

    let div = document.createElement('div');
    div.innerHTML = text;

    let as = div.getElementsByTagName('a');
    let arr = [];

    for (let i = 1; i < as.length; i++) {
        arr.push(as[i].href)
    }

    return arr;
}

async function songTiles() {
    let file = await fetch("http://127.0.0.1:3000/Spotify_Project/Live Preview/Song Tiles/");
    let text = await file.text();

    let div = document.createElement('div');
    div.innerHTML = text;

    let as = div.getElementsByTagName('a');
    let data = [];

    for(let i = 1; i < as.length; i++){
        data.push(as[i].href);
    }

    return data;
}

async function playSong(songSrc) {
    audioPlayer.volume = 0.4;
    if (audioPlayer.src !== songSrc) {
        let player = document.querySelector('.player');
        player.innerHTML = `<div class="cover-1">
                </div>
                <div class="song-info bg-trans flex">
                    <div class="bg-trans flex align-items invert">
                        <span class = "bg-trans music-name-1"></span>
                    </div>
                    <div class="bg-trans flex align-items invert ">
                    <span class = "bg-trans artist-name-1"></span></div>
                </div>`
            ;

        let arr = await infoExtract(songSrc);
        player.querySelector('.music-name-1').textContent = arr[0];
        player.querySelector('.artist-name-1').textContent = arr[1];
        player.querySelector('.cover-1').style.backgroundImage = arr[2];

        audioPlayer.src = songSrc;

        audioPlayer.play();
    } else {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    }
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }


    let timestamp = document.querySelector('.time-stamp');

    timestamp.innerHTML = `<div class="currTime bg-trans invert"></div>
    <div class="Slash bg-trans invert">/</div>
        <div class="Duration bg-trans invert"></div>`
        ;

    audioPlayer.addEventListener('timeupdate', () => {
        timestamp.querySelector('.currTime').textContent = formatTime(audioPlayer.currentTime);
        timestamp.querySelector('.Duration').textContent = formatTime(audioPlayer.duration);

        let mul = ((audioPlayer.currentTime / audioPlayer.duration) * 100);
        document.querySelector('.ball').style.left = `${mul}%`;
    });

    let seekbar = document.querySelector('.seekbar');
    seekbar.addEventListener('click', (e) => {
        const rect = seekbar.getBoundingClientRect();
        const xStart = rect.left;
        const xEnd = rect.right;

        audioPlayer.currentTime = ((e.x - xStart - 6) / (xEnd - xStart)) * (audioPlayer.duration);

    })
}

async function main() {
    let songs = await getSongs();
    let playlist = document.querySelector('.music');

    for (let i = 0; i < songs.length; i++) {
        let card = document.createElement('div');
        let cover = document.createElement('div');
        let info = document.createElement('div');
        let music = document.createElement('div');
        let artist = document.createElement('div');
        let circle = document.createElement('div');
        let play = document.createElement('img');

        play.src = "/Spotify_Project/Live Preview/Assets/Svg/play-button-svgrepo-com.svg";
        play.height = "12";
        circle.append(play);

        let arr = await infoExtract(songs[i]);
        music.textContent = arr[0];
        artist.textContent = arr[1];
        cover.style.backgroundImage = arr[2];
        cover.append(circle);

        info.append(music);
        info.append(artist);

        card.append(cover);
        card.append(info);

        // link.append(card);

        card.classList.add("music-box", "flex", "bg-trans");
        cover.classList.add("cover", "flex", "justify-content", "align-items");
        play.classList.add("bg-trans");
        circle.classList.add("circle", "flex", "justify-content", "align-items")
        info.classList.add("info", "bg-trans");
        music.classList.add("music-name", "bg-trans");
        artist.classList.add("artist-name", "bg-trans");

        card.addEventListener("click", () => playSong(songs[i]));
        playlist.append(card);

    }

    let btn = document.querySelector('.play-btn');
    btn.addEventListener('click', () => {

        if (audioPlayer.paused) {
            if (!audioPlayer.src) {
                playSong(songs[3]);
            }
            else
                audioPlayer.play();
        }
        else
            audioPlayer.pause();
    })


    document.querySelector('.hamburger').addEventListener('click', () => {
        const body = document.querySelector("body");

        const sidebar = document.querySelector('.sidebar');
        const navbar = document.querySelector('nav');

        const navbarBottom = navbar.getBoundingClientRect().bottom + window.scrollY;    
    
        sidebar.style.top = `${navbarBottom}px`;

        if (document.querySelector('.sidebar').style.left == "0px") {
            document.querySelector('.sidebar').style.left = "-600px"
            body.classList.toggle("no-scroll");
        }
        else {
            document.querySelector('.sidebar').style.left = "0px";
            body.classList.toggle("no-scroll");
        }
    })

    let folders = await getFolders();
    let list = document.querySelector('.artist-list');

    for (let i = 0; i < folders.length; i++) {
        let card = document.createElement('div');
        card.classList.add("bg-trans", "artist-card");
        card.innerHTML = `        <div class="bg-trans relative">
                            <img class="card-img" src="" alt="">
                            <button class="play-btn-green flex justify-content align-items">
                                <svg class="bg-trans green-img" data-encore-id="icon" role="img" aria-hidden="true" class="e-9640-icon" viewBox="0 0 24 24" height="25px"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                            </button>
                        </div>
                        <div class="text bg-trans flex column">
                            <span class="bg-trans folder-name"></span>
                            <span class="bg-trans font-size-13 clr-gry">Artist</span>
                        </div>
                    `
            ;

        let name = folders[i].split("Artist/")[1];
        name = name.replaceAll('%20', ' ');
        name = name.replaceAll('/', ' ');
        
        let div = document.createElement('div');
        div.innerHTML = await ((await fetch(`${folders[i]}cover`)).text());
        let src = div.getElementsByTagName('a');
        card.querySelector('.card-img').src = src[1];

        card.querySelector('.text > span:first-child').textContent = `${name}`;
        list.append(card);
    }

    let tiles_data = await songTiles();
    let tile_list = document.querySelector('.tile-list');

    for(let i = 0; i < tiles_data.length; i++){
        let curr = await infoExtract(tiles_data[i]);
        let tile = document.createElement('div');

        tile.classList.add("bg-trans", "relative", "song-tile");
        tile.innerHTML = `<div class="tile-img"></div>
                        <button class="play-btn-green flex justify-content align-items">
                            <svg class="bg-trans green-img" data-encore-id="icon" role="img" aria-hidden="true" class="e-9640-icon" viewBox="0 0 24 24" height="25px"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                        </button>
                        <div class="text bg-trans flex column">
                            <span class="bg-trans folder-name"></span>
                            <span class="bg-trans font-size-13 clr-gry singer"></span>
                        </div>`;
        
        curr[0] = curr[0].replaceAll(" - PagalNew", "");
        
        tile.querySelector('.folder-name').textContent = curr[0];  
        tile.querySelector('.singer').textContent = curr[1];  
        tile.querySelector('.tile-img').style.backgroundImage = curr[2];

        tile.addEventListener('click', ()=>{
            playSong(tiles_data[i]);
        })
        tile_list.append(tile);
    }

    document.querySelector('.list-icon').addEventListener('click', ()=>{
        if(document.querySelector('.hidden-list').style.top == "50px"){
            document.querySelector('.hidden-list').style.top = "-220px";
        }
        else{
            document.querySelector('.hidden-list').style.top = "50px";
        }
    })

    const slider = document.querySelector(".slider");

    slider.addEventListener("input", function () {
        let value = (this.value - this.min) / (this.max - this.min);
        audioPlayer.volume = value;
        
        value *= 100;
        this.style.background = `linear-gradient(to right, rgba(0, 0, 0, 0.53) ${value}%, transparent ${value}%)`;
    });
    
}



main();




