(function () {
    runOptions()

    function runOptions(){
        chrome.storage.sync.get('checkboxStates', (data) => {
            const checkboxStates = data.checkboxStates || {};
            const paidPromotionValue = checkboxStates['paid-promotion'];
            const removeDislikesValue = checkboxStates['dislikes'];
    
            if (paidPromotionValue) {
                removePaidPromotion();
            }
    
            if (removeDislikesValue && window.location.pathname === '/watch') {
                addDislikes();
            }
        });
    }

    // to see changes in the URL
    const observer = new MutationObserver(() => {
        console.log('URL changed to:', window.location.href);
        runOptions();
    });
    
    observer.observe(document.querySelector('title'), { subtree: true, characterData: true, childList: true });


    // Helper to ensure the element is present, even if dynamically loaded
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    callback(element);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
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


    

    async function addDislikes() {
        const videoId = new URLSearchParams(window.location.search).get('v');
        console.log("Video ID is: " + videoId);

        if (!videoId) {
            console.error("No video ID found in the URL.");
            return;
        }

        const dislikes = await getDislikes(videoId);
        if (dislikes !== null) {
            console.log(`Dislikes: ${dislikes}`);

            waitForElement('button[title="I dislike this"]', (element) => {
                if (!element.querySelector('.yt-spec-button-shape-next__button-text-content')) {
                    console.log("Element found and modifying:", element);

                    element.style.width = "90px";

                    element.insertAdjacentHTML(
                        "beforeend",
                        `<div class="yt-spec-button-shape-next__button-text-content">${dislikes}</div>`
                    );
                }
            })
        }
    }

    function getDislikes(videoId) {
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
