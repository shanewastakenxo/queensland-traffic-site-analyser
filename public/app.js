const siteSelect = document.getElementById("site-select");
const siteDetails = document.getElementById("site-details");
const errorMessage = document.getElementById("error-message");

const searchInput = document.getElementById("site-search");
const searchButton = document.getElementById("search-button");
const searchMessage = document.getElementById("search-message");

const siteIdElement = document.getElementById("site-id");
const roadNameElement = document.getElementById("road-name");
const descriptionElement = document.getElementById("description");

const busiestDayElement =
    document.getElementById("busiest-day");

const busiestDayVolumeElement =
    document.getElementById("busiest-day-volume");

const busiestHourElement =
    document.getElementById("busiest-hour");

const busiestHourVolumeElement =
    document.getElementById("busiest-hour-volume");

const weekdayAverageElement =
    document.getElementById("weekday-average");

const weekendAverageElement =
    document.getElementById("weekend-average");

const weekdayBar =
    document.getElementById("weekday-bar");

const weekendBar =
    document.getElementById("weekend-bar");

const comparisonSummary =
    document.getElementById("comparison-summary");


let trafficSites = [];


function formatNumber(number) {
    return new Intl.NumberFormat("en-AU").format(number);
}


function createComparisonText(weekdayAverage, weekendAverage) {
    if (weekdayAverage === weekendAverage) {
        return "Weekday and weekend traffic are approximately equal.";
    }

    const largerValue = Math.max(
        weekdayAverage,
        weekendAverage
    );

    const smallerValue = Math.min(
        weekdayAverage,
        weekendAverage
    );

    const percentageDifference = Math.round(
        ((largerValue - smallerValue) / smallerValue) * 100
    );

    if (weekdayAverage > weekendAverage) {
        return (
            `Weekday traffic is approximately ` +
            `${percentageDifference}% higher than weekend traffic.`
        );
    }

    return (
        `Weekend traffic is approximately ` +
        `${percentageDifference}% higher than weekday traffic.`
    );
}


function displaySite(site) {
    siteIdElement.textContent = site.siteId;
    roadNameElement.textContent = site.roadName;
    descriptionElement.textContent = site.description;

    busiestDayElement.textContent = site.busiestDay;

    busiestDayVolumeElement.textContent =
        `${formatNumber(site.busiestDayVolume)} vehicles`;

    busiestHourElement.textContent = site.busiestHour;

    busiestHourVolumeElement.textContent =
        `${formatNumber(site.busiestHourVolume)} average vehicles`;

    weekdayAverageElement.textContent =
        `${formatNumber(site.weekdayAverage)} vehicles`;

    weekendAverageElement.textContent =
        `${formatNumber(site.weekendAverage)} vehicles`;

    const largestAverage = Math.max(
        site.weekdayAverage,
        site.weekendAverage,
        1
    );

    const weekdayWidth =
        (site.weekdayAverage / largestAverage) * 100;

    const weekendWidth =
        (site.weekendAverage / largestAverage) * 100;

    weekdayBar.style.width = `${weekdayWidth}%`;
    weekendBar.style.width = `${weekendWidth}%`;

    comparisonSummary.textContent = createComparisonText(
        site.weekdayAverage,
        site.weekendAverage
    );

    siteDetails.classList.remove("hidden");
}


function normaliseText(text) {
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function getSiteSearchText(site) {
    return normaliseText(
        `${site.roadName} ${site.description} ${site.siteId}`
    );
}


function levenshteinDistance(firstWord, secondWord) {
    const previousRow = [];

    for (
        let column = 0;
        column <= secondWord.length;
        column += 1
    ) {
        previousRow[column] = column;
    }

    for (
        let row = 1;
        row <= firstWord.length;
        row += 1
    ) {
        const currentRow = [row];

        for (
            let column = 1;
            column <= secondWord.length;
            column += 1
        ) {
            const lettersMatch =
                firstWord[row - 1] === secondWord[column - 1];

            const replacementCost =
                lettersMatch ? 0 : 1;

            currentRow[column] = Math.min(
                currentRow[column - 1] + 1,
                previousRow[column] + 1,
                previousRow[column - 1] + replacementCost
            );
        }

        for (
            let column = 0;
            column <= secondWord.length;
            column += 1
        ) {
            previousRow[column] = currentRow[column];
        }
    }

    return previousRow[secondWord.length];
}


function calculateSearchScore(site, searchText) {
    const fullSiteText = getSiteSearchText(site);

    if (fullSiteText.includes(searchText)) {
        return 1;
    }

    const searchWords = searchText.split(" ");
    const siteWords = fullSiteText.split(" ");

    let totalScore = 0;

    searchWords.forEach((searchWord) => {
        let bestWordScore = 0;

        siteWords.forEach((siteWord) => {
            const longestLength = Math.max(
                searchWord.length,
                siteWord.length
            );

            if (longestLength === 0) {
                return;
            }

            const distance = levenshteinDistance(
                searchWord,
                siteWord
            );

            const similarity =
                1 - distance / longestLength;

            if (similarity > bestWordScore) {
                bestWordScore = similarity;
            }
        });

        totalScore += bestWordScore;
    });

    return totalScore / searchWords.length;
}


function populateSiteMenu(sitesToDisplay) {
    siteSelect.innerHTML = "";

    sitesToDisplay.forEach((site) => {
        const option = document.createElement("option");

        option.value = site.siteId;

        option.textContent =
            `${site.roadName} — ${site.description} ` +
            `(Site ${site.siteId})`;

        siteSelect.appendChild(option);
    });

    if (sitesToDisplay.length > 0) {
        siteSelect.value = sitesToDisplay[0].siteId;
        displaySite(sitesToDisplay[0]);
    }
}


function searchTrafficSites() {
    const searchText = normaliseText(searchInput.value);

    if (searchText === "") {
        populateSiteMenu(trafficSites);

        searchMessage.textContent =
            "Showing all traffic monitoring sites.";

        return;
    }

    const exactMatches = trafficSites.filter((site) =>
        getSiteSearchText(site).includes(searchText)
    );

    if (exactMatches.length > 0) {
        populateSiteMenu(exactMatches);

        searchMessage.textContent =
            `Found ${exactMatches.length} matching site` +
            `${exactMatches.length === 1 ? "" : "s"}.`;

        return;
    }

    const fuzzyMatches = trafficSites
        .map((site) => ({
            site: site,
            score: calculateSearchScore(
                site,
                searchText
            )
        }))
        .filter((result) => result.score >= 0.55)
        .sort(
            (firstResult, secondResult) =>
                secondResult.score - firstResult.score
        )
        .slice(0, 20)
        .map((result) => result.site);

    if (fuzzyMatches.length === 0) {
        searchMessage.textContent =
            "No close traffic sites were found.";

        return;
    }

    populateSiteMenu(fuzzyMatches);

    searchMessage.textContent =
        "No exact match found. Showing the closest results.";
}


siteSelect.addEventListener("change", () => {
    const selectedSiteId = Number(siteSelect.value);

    const selectedSite = trafficSites.find(
        (site) => site.siteId === selectedSiteId
    );

    if (selectedSite) {
        displaySite(selectedSite);
    }
});


searchButton.addEventListener(
    "click",
    searchTrafficSites
);


searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchTrafficSites();
    }
});


searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() === "") {
        populateSiteMenu(trafficSites);
        searchMessage.textContent = "";
    }
});


fetch("/results.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error(
                "The traffic results could not be loaded."
            );
        }

        return response.json();
    })
    .then((data) => {
        trafficSites = data;

        trafficSites.sort(
            (firstSite, secondSite) =>
                firstSite.roadName.localeCompare(
                    secondSite.roadName
                )
        );

        populateSiteMenu(trafficSites);
    })
    .catch((error) => {
        siteSelect.innerHTML =
            "<option>Unable to load traffic sites</option>";

        errorMessage.textContent = error.message;

        console.error(error);
    });