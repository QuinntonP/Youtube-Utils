(function () {
    console.log("Okay content script is running");

    console.log("URL changed to:", location.href);
    chrome.storage.sync.get('checkboxStates', (data) => {
    const checkboxStates = data.checkboxStates || {};
    const paidPromotionValue = checkboxStates['paid-promotion'];
    const removeDislikesValue = checkboxStates['dislikes'];
    const removeTitles = checkboxStates['remove-titles']

        if (location.hostname.includes("youtube.com")){

        if (paidPromotionValue) {
            removePaidPromotion();
        }

        if (removeDislikesValue) {
            addDislikes();
        }

        if (removeTitles){
            removeTitle();
        }
    }


    });

    let lastVideoId = null;

    const observer = new MutationObserver(() => {
        const videoId = new URLSearchParams(window.location.search).get("v");
        if (!videoId || videoId === lastVideoId) return;

        lastVideoId = videoId;
        chrome.storage.sync.get('checkboxStates', (data) => {
            const checkboxStates = data.checkboxStates || {};
            if (checkboxStates['dislikes']) {
                addDislikes();
            }  
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });


    function removeTitle() {
        // I should probably make it observe and watch for changes... but meh.
        setInterval(() => {
            document.title = " :) ";
            document.querySelector('#title yt-formatted-string')?.remove();
        }, 300);

        
    }


    function removePaidPromotion() {
        console.log("Removing Paid promotions");
        const style = document.createElement('style');
        style.textContent = `
            .YtmPaidContentOverlayHost, 
            .ytmPaidContentOverlayHost, 
            ytm-paid-content-overlay-renderer {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }


    function formatCount(n) {
        if (n >= 1_000_000) {
            return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (n >= 1_000) {
            return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return n.toString();
    }
    

    async function addDislikes() {
        const videoId = new URLSearchParams(window.location.search).get("v");
        if (!videoId) return;
    
        const dislikeCount = await getDislikes(videoId);
        if (dislikeCount === null) return;

        dislikeCount
    
        const injectDislikeCount = () => {
            const buttons = document.querySelectorAll('#top-level-buttons-computed button');
            if (buttons.length < 2) return false;
    
            const dislikeBtn = buttons[1];
    
            // Remove old one if it exists (in case of re-render)
            const existing = dislikeBtn.querySelector('.custom-dislike-count');
            if (existing) existing.remove();
    
            const span = document.createElement('span');
            span.className = 'custom-dislike-count';
            span.style.marginLeft = '6px';
            span.style.fontSize = '14px';
            span.style.color = 'var(--yt-spec-text-secondary)';
            span.style.pointerEvents = 'none';
            span.style.userSelect = 'none';
            span.textContent = formatCount(dislikeCount);

    
            dislikeBtn.appendChild(span);
            return true;
        };
    
        // Try to inject multiple times (since YouTube may overwrite it)
        let attempts = 0;
        const interval = setInterval(() => {
            const success = injectDislikeCount();
            attempts++;
            if (success || attempts > 40) clearInterval(interval); // Give up after ~2s
        }, 100);
    }
    

    async function getDislikes(videoId) {
        const apiUrl = `https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`;
    
        return fetch(apiUrl, {
            method: "GET",
            headers: { "Accept": "application/json" },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => data.dislikes) // Extract dislikes from the API response
            .catch((error) => {
                console.error("Error fetching data:", error);
                return null;
            });
    }
    
})();
