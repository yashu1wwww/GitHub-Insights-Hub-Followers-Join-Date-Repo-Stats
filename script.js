document.addEventListener("DOMContentLoaded", function () {
    const actionSelect = document.getElementById("action");
    const inputField = document.getElementById("input");
    const searchButton = document.getElementById("searchButton");
    const resultDiv = document.getElementById("result");

    // Handle dropdown change event
    actionSelect.addEventListener("change", function () {
        inputField.value = "";
        resultDiv.innerHTML = "";

        if (this.value === "repoDate" || this.value === "repoStats") {
            inputField.placeholder = "Enter GitHub Repo URL";
        } else {
            inputField.placeholder = "Enter GitHub Username or Profile URL";
        }
    });

    // Trigger search on pressing Enter key
    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            fetchData();
        }
    });

    // Trigger search on button click
    searchButton.addEventListener("click", function () {
        fetchData();
    });

    // Fetch Data function
    function fetchData() {
        let action = actionSelect.value;
        let input = inputField.value.trim();
        resultDiv.innerHTML = '<div class="skeleton"></div>'; // Show loading animation

        let apiUrl = "";

        if (action === "followers") {
            if (!isValidUsername(input)) {
                showPopupError("❌ Please enter a valid GitHub username or profile URL!");
                return;
            }
            let username = extractUsername(input);
            apiUrl = `https://api.github.com/users/${username}`;
        } 
        else if (action === "repoDate" || action === "repoStats") {
            if (!isValidRepoUrl(input)) {
                showPopupError("❌ Please enter a valid GitHub repository URL!");
                return;
            }
            let repoPath = extractRepoPath(input);
            apiUrl = `https://api.github.com/repos/${repoPath}`;
        }

        if (!apiUrl) {
            showPopupError("Invalid input. Please enter a valid GitHub username or repository URL.");
            return;
        }

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("❌ Failed to fetch GitHub API.");
                }
                return response.json();
            })
            .then(data => {
                setTimeout(() => {
                    if (action === "followers") {
                        if (!data.followers || !data.created_at) {
                            showPopupError("❌ Invalid username. Please try again.");
                            return;
                        }
                        let joinedDate = formatDate(data.created_at);
                        resultDiv.innerHTML = `<strong>Followers:</strong> ${data.followers}<br><strong>Joined on:</strong> ${joinedDate}`;
                    } 
                    else if (action === "repoDate") {
                        if (!data.created_at) {
                            showPopupError("❌ Invalid repository URL.");
                            return;
                        }
                        let createdDate = formatDate(data.created_at);
                        resultDiv.innerHTML = `<strong>Created on:</strong> ${createdDate}`;
                    } 
                    else if (action === "repoStats") {
                        if (data.forks === undefined || data.stargazers_count === undefined) {
                            showPopupError("❌ Repository not found.");
                            return;
                        }
                        resultDiv.innerHTML = `<strong>Forks:</strong> ${data.forks}<br><strong>Stars:</strong> ${data.stargazers_count}`;
                    }
                }, 1000);
            })
            .catch(() => showPopupError("❌ Please enter correct details."));
    }

    // Extract username from GitHub profile URL
    function extractUsername(input) {
        return input.startsWith("https://github.com/") ? input.replace("https://github.com/", "").split("/")[0] : input;
    }

    // Extract repository path (user/repo) from GitHub URL
    function extractRepoPath(url) {
        return url.replace("https://github.com/", "").trim();
    }

    // Validate GitHub repository URL
    function isValidRepoUrl(url) {
        return /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/.test(url);
    }

    // Validate GitHub username
    function isValidUsername(input) {
        return /^[a-zA-Z0-9-]+$/.test(input) || 
               (/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/?$/.test(input) && !isValidRepoUrl(input));
    }

    // Format date to DD/MM/YYYY
    function formatDate(dateString) {
        let date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    // Display error popup
    function showPopupError(message) {
        alert(message);
        resultDiv.innerHTML = "";
    }
});
