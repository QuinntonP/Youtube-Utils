document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // Load and apply saved states when the popup is opened
    chrome.storage.sync.get('checkboxStates', (data) => {
        const states = data.checkboxStates || {};
        checkboxes.forEach((checkbox) => {
            const id = checkbox.id;
            checkbox.checked = states[id] || false; // Default to false
            console.log(`Loaded state for ${id}: ${checkbox.checked}`);
        });
    });

    // Save the state whenever a checkbox is toggled
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            const id = checkbox.id;
            chrome.storage.sync.get('checkboxStates', (data) => {
                const states = data.checkboxStates || {};
                states[id] = checkbox.checked; // Save the current state
                chrome.storage.sync.set({ checkboxStates: states }, () => {
                    console.log(`Saved state for ${id}: ${checkbox.checked}`);
                });
            });
        });
    });

    // Example: Checking a specific checkbox with ID 'paid-promotion'
    const paidPromotion = document.getElementById('paid-promotion');
    if (paidPromotion) {
        console.log("paid-promotion element found:", paidPromotion);
    } else {
        console.error("paid-promotion element not found! Check your HTML for an element with ID 'paid-promotion'.");
    }

    const dislikes = document.getElementById('dislikes');
    if (dislikes) {
        console.log("dislikes")
    }
});

console.log("Okay, script initialized successfully.");