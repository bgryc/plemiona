javascript:
if (game_data.device === "desktop") {
    if (game_data.screen === "am_farm") {
        LvlBuildingsAF();
    } else {
        UI.ErrorMessage("Użyj skryptu w zakładce Poproś o pomoc");
    }
} else {
    UI.ErrorMessage("Skryptu nie można użyć na urządzeniu mobilnym");
}

function LvlBuildingsAF() {
    const availableBuildings = ["Ratusz", "Koszary", "Kuźnia", "Plac", "Rynek", "Tartak"];
    let selectedBuilding = "Koszary"; 

    function refreshBuildingData() {
        document.querySelectorAll(".building-level-cell").forEach(cell => cell.remove());
        loadBuildingLevels();
    }

    const farmTable = document.querySelector("#plunder_list");
    if (farmTable) {
        let headerRow = farmTable.querySelector("thead tr") || farmTable.querySelector("tbody tr");
        if (headerRow) {
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
                console.log(`Wybrano budynek: ${selectedBuilding}`);
                refreshBuildingData();
            });

            selectCell.appendChild(select);
            headerRow.appendChild(selectCell);
        } else {
            console.warn("Nie znaleziono nagłówka tabeli asystenta farmera");
        }
    } else {
        console.warn("Nie znaleziono tabeli asystenta farmera");
    }

    async function loadBuildingLevels() {
        const reportLinks = [...document.querySelectorAll("a[href*='screen=report'][href*='view=']")].map(a => ({ href: a.href, element: a }));

        for (let { href, element } of reportLinks) {
            try {
                console.log(`Pobieram raport: ${href}`);
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

                console.log(`Poziom ${selectedBuilding}: ${buildingLevel}`);

                const row = element.closest("tr");
                if (row) {
                    const cell = document.createElement("td");
                    cell.textContent = buildingLevel;
                    cell.classList.add("building-level-cell");
                    row.appendChild(cell);
                } else {
                    console.warn(`Nie znaleziono wiersza dla raportu: ${href}`);
                }
            } catch (error) {
                console.error(`Błąd pobierania raportu (${href}):`, error);
            }
        }
    }

    loadBuildingLevels();
}
