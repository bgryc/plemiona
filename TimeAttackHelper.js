(function updateTimes() {
    document.querySelectorAll(".relative_time").forEach(span => {
        let now = new Date(); // Aktualny czas

        // Pobierz czas trwania ataku z atrybutu data-duration
        let durationSeconds = parseInt(span.getAttribute("data-duration"), 10);

        // Oblicz czas przybycia dodając czas trwania do aktualnego czasu
        let arrivalTime = new Date(now.getTime() + durationSeconds * 1000);

        // Formatowanie aktualnego czasu (czasu wyjścia)
        let nowHours = String(now.getHours()).padStart(2, "0");
        let nowMinutes = String(now.getMinutes()).padStart(2, "0");
        let nowSeconds = String(now.getSeconds()).padStart(2, "0");
        let nowMilliseconds = String(now.getMilliseconds()).padStart(3, "0");

        // Formatowanie czasu przybycia
        let hours = String(arrivalTime.getHours()).padStart(2, "0");
        let minutes = String(arrivalTime.getMinutes()).padStart(2, "0");
        let seconds = String(arrivalTime.getSeconds()).padStart(2, "0");
        let milliseconds = String(arrivalTime.getMilliseconds()).padStart(3, "0");

        // Znajdź tabelę, do której należy span
        let table = span.closest('table');

        // Sprawdź, czy już istnieje wiersz z czasem wyjścia
        let exitTimeRow = table.querySelector('.exit_time_row');
        if (!exitTimeRow) {
            // Dodaj nowy wiersz z czasem wyjścia
            exitTimeRow = table.insertRow(2);
            exitTimeRow.className = 'exit_time_row';
            let cell1 = exitTimeRow.insertCell(0);
            let cell2 = exitTimeRow.insertCell(1);
            cell1.textContent = 'Czas wyjścia:';
            cell2.className = 'exit_time';
        }

        // Zaktualizuj czas wyjścia
        let exitTimeCell = exitTimeRow.querySelector('.exit_time');
        exitTimeCell.textContent = `dzisiaj o ${nowHours}:${nowMinutes}:${nowSeconds}.${nowMilliseconds}`;

        // Zaktualizuj czas przybycia
        span.textContent = `dzisiaj o ${hours}:${minutes}:${seconds}.${milliseconds}`;
    });

    requestAnimationFrame(updateTimes); // Zapewnia płynne odświeżanie
})();
