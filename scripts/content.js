(function () {
    console.log("Okay content script is running");

    console.log("URL changed to:", location.href);
    chrome.storage.sync.get('checkboxStates', (data) => {
    const checkboxStates = data.checkboxStates || {};
    const paidPromotionValue = checkboxStates['paid-promotion'];
    const removeDislikesValue = checkboxStates['dislikes'];

        if (paidPromotionValue) {
            removePaidPromotion();
        }

        if (removeDislikesValue) {
            addDislikes();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

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

    function addDislikes() {
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
