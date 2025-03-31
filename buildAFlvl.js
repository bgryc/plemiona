javascript: (function () {
    // Ensure the script is running on the correct device and screen
    if (game_data.device !== "desktop") {
        return UI.ErrorMessage("This script works only on the desktop version.");
    }
    if (game_data.screen !== "am_farm") {
        return UI.ErrorMessage("Please run this script in the assistant farmer screen.");
    }

    // Main function to level buildings in assistant farmer
    (function levelBuildingsAF() {
        const availableBuildings = ["Ratusz", "Koszary", "Kuźnia", "Plac", "Rynek", "Tartak"];
        let selectedBuilding = "Koszary";

        // Function to refresh building data
        function refreshBuildingData() {
            document.querySelectorAll(".building-level-cell").forEach(cell => cell.remove());
            loadBuildingLevels();
        }

        const farmTable = document.querySelector("#plunder_list");
        if (!farmTable) {
            return console.warn("Assistant farmer table not found.");
        }

        let headerRow = farmTable.querySelector("thead tr") || farmTable.querySelector("tbody tr");
        if (!headerRow) {
            return console.warn("Assistant farmer table header not found.");
        }

        // Create and add building selector dropdown
        const selectCell = document.createElement("th");
        const select = document.createElement("select");
        select.id = "buildingSelector";

        availableBuildings.forEach(building => {
            const option = document.createElement("option");
            option.value = building;
            option.textContent = building;
            select.appendChild(option);
        });

        select.value = selectedBuilding;
        select.addEventListener("change", () => {
            selectedBuilding = select.value;
            console.log(`Selected building: ${selectedBuilding}`);
            refreshBuildingData();
        });

        selectCell.appendChild(select);
        headerRow.appendChild(selectCell);

        // Function to load building levels from reports
        async function loadBuildingLevels() {
            const reportLinks = [...document.querySelectorAll("a[href*='screen=report'][href*='view=']")].map(a => ({ href: a.href, element: a }));

            for (let { href, element } of reportLinks) {
                try {
                    console.log(`Fetching report: ${href}`);
                    const response = await fetch(href);
                    const text = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, "text/html");

                    const tables = ["#attack_spy_buildings_left", "#attack_spy_buildings_right"];
                    let buildingLevel = "?";

                    for (let tableId of tables) {
                        const table = doc.querySelector(tableId);
                        if (table) {
                            const rows = table.querySelectorAll("tr");
                            for (let row of rows) {
                                const buildingName = row.querySelector("td span.middle");
                                const levelCell = row.querySelector("td.middle");

                                if (buildingName && levelCell && buildingName.textContent.trim() === selectedBuilding) {
                                    buildingLevel = levelCell.textContent.trim();
                                    break;
                                }
                            }
                        }
                        if (buildingLevel !== "?") break;
                    }

                    console.log(`Level of ${selectedBuilding}: ${buildingLevel}`);

                    const row = element.closest("tr");
                    if (row) {
                        const cell = document.createElement("td");
                        cell.textContent = buildingLevel;
                        cell.classList.add("building-level-cell");
                        row.appendChild(cell);
                    } else {
                        console.warn(`Row for report not found: ${href}`);
                    }
                } catch (error) {
                    console.error(`Error fetching report (${href}):`, error);
                }
            }
        }

        // Initial load of building levels
        loadBuildingLevels();
    })();
})();
