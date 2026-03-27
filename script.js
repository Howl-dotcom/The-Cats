document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELECTIONS ---
    const audio = document.getElementById('catAudio');
    const playBtn = document.getElementById('playBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    
    const dropZone = document.getElementById('dropZone');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const galleryGrid = document.getElementById('galleryGrid');
    const aboutSection = document.querySelector('.about-container');
    const header = document.querySelector('header');

    // --- 2. ENHANCED MUSIC PLAYER LOGIC ---
    const songs = [
        { title: "Pag-Ibig ay Kanibalismo II", artist: "Fitterkarma", cover: "images/relapse.png", file: "audio/music.mp3" },
        { title: "Standstill (My My My)", artist: "Max McNown", cover: "images/cover2.png", file: "audio/song2.mp3" },
        { title: "Glue Song", artist: "beabadoobee", cover: "images/cover3.png", file: "audio/song3.mp3" },
        { title: "Spark Instrumental Song", artist: "ColdPlay", cover: "images/cover4.png", file: "audio/song4.mp3" }
    ];

    let songIndex = 0;

    function loadSong(song) {
        document.getElementById('currentTitle').innerText = song.title;
        document.getElementById('currentArtist').innerText = song.artist;
        document.getElementById('currentCover').src = song.cover;
        audio.src = song.file;
    }

    if (playBtn && audio) {
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = "&#9208;";
                document.getElementById('currentCover').classList.add('playing-animation');
            } else {
                audio.pause();
                playBtn.innerHTML = "&#9205;";
                document.getElementById('currentCover').classList.remove('playing-animation');
            }
        });

        nextBtn.addEventListener('click', () => {
            songIndex = (songIndex + 1) % songs.length;
            loadSong(songs[songIndex]);
            audio.play();
            playBtn.innerHTML = "&#9208;";
        });

        prevBtn.addEventListener('click', () => {
            songIndex = (songIndex - 1 + songs.length) % songs.length;
            loadSong(songs[songIndex]);
            audio.play();
            playBtn.innerHTML = "&#9208;";
        });

        audio.addEventListener('timeupdate', () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            if (progressBar) progressBar.style.width = `${percent}%`;
        });

        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const width = progressContainer.clientWidth;
                const clickX = e.offsetX;
                const duration = audio.duration;
                audio.currentTime = (clickX / width) * duration;
            });
        }
    }

    // --- 3. INFINITE GALLERY & DATABASE LOGIC (IndexedDB) ---
    let db;
    const request = indexedDB.open("CatGalleryDB", 1);

    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains("photos")) {
            db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        loadGallery(); 
    };

    function savePhoto(base64Data) {
        const transaction = db.transaction(["photos"], "readwrite");
        const store = transaction.objectStore("photos");
        const addRequest = store.add({ data: base64Data });

        addRequest.onsuccess = (e) => {
            displayImage(base64Data, e.target.result);
        };
    }

    function loadGallery() {
        const transaction = db.transaction(["photos"], "readonly");
        const store = transaction.objectStore("photos");
        const getRequest = store.getAll();

        getRequest.onsuccess = () => {
            getRequest.result.forEach(item => displayImage(item.data, item.id));
        };
    }

function displayImage(src, id) {
    if (!galleryGrid) return;
    const wrapper = document.createElement('div');
    wrapper.classList.add('gallery-wrapper');
    wrapper.style.position = 'relative'; 

   
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('gallery-item');

    const delBtn = document.createElement('button');
    delBtn.innerHTML = "&times;"; 
    delBtn.classList.add('delete-btn');

   
    const modal = document.getElementById('imageModal');
    const fullImg = document.getElementById('fullImage');
    const closeBtn = document.querySelector('.close-modal');

    img.addEventListener('click', () => {
        modal.style.display = "flex";
        fullImg.src = src;
    });

    // --- DELETE LOGIC ---
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        
        if(confirm("Delete this photo?")) {
            const transaction = db.transaction(["photos"], "readwrite");
            const store = transaction.objectStore("photos");
            store.delete(id);

           
            wrapper.remove();
        }
    });

   
    wrapper.appendChild(img);
    wrapper.appendChild(delBtn);
    galleryGrid.appendChild(wrapper);

   
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = "none";
    }
}
    // --- 4. UPLOAD HANDLERS ---
    if (dropZone) dropZone.addEventListener('click', () => fileInput.click());
    if (uploadBtn) uploadBtn.addEventListener('click', () => fileInput.click());

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    savePhoto(e.target.result); 
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 5. SCROLL & ANIMATIONS ---
    window.addEventListener('scroll', () => {
        if (header) {
            header.style.backgroundColor = window.scrollY > 50 ? '#000' : 'transparent';
        }
    });

    if (aboutSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        }, { threshold: 0.1 });
        observer.observe(aboutSection);
    }
});

// GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
gsap.from(".about-container", {
    scrollTrigger: {
        trigger: ".about-section",
        start: "top 80%",
    },
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power2.out"
});