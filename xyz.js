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
