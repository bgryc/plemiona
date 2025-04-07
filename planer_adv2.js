if(!$("#planer_klinow").length){
    var konfiguracja = konfiguracjaSwiata();

    var dane = {
        predkosc_gry:Number($(konfiguracja).find("config speed").text()),
        predkosc_jednostek:Number($(konfiguracja).find("config unit_speed").text()),
        lucznicy:Number($(konfiguracja).find("game archer").text()),
        rycerz:Number($(konfiguracja).find("game knight").text()),
        linkDoWojska:"/game.php?&village="+game_data.village.id+"&type=own_home&mode=units&group=0&page=-1&screen=overview_villages",
        linkDoPrzegladuWioski:"/game.php?",
        linkDorozkazu:"/game.php?",
        predkosci:[18,22,18,18,9,10,10,11,30,30,10,35],
        nazwyWojsk:["Pikinier","Miecznik","Topornik","Łucznik","Zwiadowca","LK","ŁNK","CK","Taran","Katapulta","Rycerz","Szlachcic"]
    };

    var pobieram = true;
    var sort_malejaco = true;
    var img_wojsk = image_base + "unit/";
    var czasWyjscia = [];
    var id=[], wojska=[], mojeWioski=[], nazwyWiosek = [], tabelkaBB = [];
    var obrazki = "spear,sword,axe,archer,spy,light,marcher,heavy,ram,catapult,knight,snob".split(",");
    var aktywneJednostki = ("111"+(dane.lucznicy?"1011111":"01111")+(dane.rycerz?"10":"0")).split("");

    if(!dane.lucznicy){
        ["archer","marcher"].forEach(jedn => {
            let idx = obrazki.indexOf(jedn);
            dane.predkosci.splice(idx,1);
            dane.nazwyWojsk.splice(idx,1);
            obrazki.splice(idx,1);
        });
    }

    if(!dane.rycerz){
        let idx = obrazki.indexOf("knight");
        dane.predkosci.splice(idx,1);
        dane.nazwyWojsk.splice(idx,1);
        obrazki.splice(idx,1);
    }

    var t = $('#serverTime').html().match(/\d+/g);
    var d = $('#serverDate').html().match(/\d+/g);
    var obecnyCzas = new Date(d[2],d[1]-1,d[0],t[0],t[1],t[2]);

    if(game_data.player.sitter != 0){
        dane.linkDoWojska="/game.php?t=" + game_data.player.id + "&village="+game_data.village.id+"&type=own_home&mode=units&group=0&page=-1&screen=overview_villages";
        dane.linkDoPrzegladuWioski += "t=" + game_data.player.id + "&village="+game_data.village.id+"&screen=info_village&id=";
        dane.linkDorozkazu += "t=" + game_data.player.id + "&village=";
    } else {
        dane.linkDoPrzegladuWioski += "village="+game_data.village.id+"&screen=info_village&id=";
        dane.linkDorozkazu += "village=";
    }

    var predkosc_swiata = Number((dane.predkosc_gry * dane.predkosc_jednostek).toFixed(5));
    dane.predkosci = dane.predkosci.map(p => p / predkosc_swiata);

    rysujPlaner();
    pobierzDane();
} else {
    $("#planer_klinow").remove();
}
void 0;

function wypiszMozliwosci(){
    if(pobieram){ $("#ladowanie").html("Czekaj..."); setTimeout(wypiszMozliwosci, 500); return; }

    var html = [], htmlTmp = [];
    var najwJednostka = -1;
    var cel = document.getElementById('wspolrzedneCelu').value.match(/\d+/g);
    var godzinaWejscia = document.getElementById('godzina_wejscia').value.match(/\d+/g);
    var dataWejscia = document.getElementById('data_wejscia').value.match(/\d+/g);
    var t = $('#serverTime').html().match(/\d+/g);
    var d = $('#serverDate').html().match(/\d+/g);
    var obecnyCzas = new Date(d[2],d[1]-1,d[0],t[0],t[1],t[2]);
    var czasWejscia = new Date(dataWejscia[2], dataWejscia[1] - 1, dataWejscia[0], godzinaWejscia[0], godzinaWejscia[1], godzinaWejscia[2]);
    var roznicaSekund=(czasWejscia-obecnyCzas)/1000;

    var ilosc_wiosek = 0;
    for(let i=0;i<mojeWioski.length;i++){
        htmlTmp[i] = "<tr><td><a href="+dane.linkDoPrzegladuWioski+id[i]+">"+nazwyWiosek[i].replace(/\s+/g, "\u00A0")+"</a>";
        let najwolniejsza = 0;
        let mozliwewojska = "&from=simulator";

        for(let j=0;j<dane.predkosci.length;j++){
            let a = Math.abs(Number(cel[0]) - mojeWioski[i][mojeWioski[i].length-3]);
            let b = Math.abs(Number(cel[1]) - mojeWioski[i][mojeWioski[i].length-2]);
            let czasPrzejscia = Math.sqrt((a * a) + (b * b)) * dane.predkosci[j]*60;

            if(czasPrzejscia <= roznicaSekund){
                if(czasPrzejscia > najwolniejsza){ najwolniejsza = czasPrzejscia; najwJednostka = j; }
                mozliwewojska += "&att_"+obrazki[j]+"="+(wojska[i][j]||0);
                htmlTmp[i] += "<td style='background-color: #C3FFA5;'>"+(wojska[i][j]||0);
            } else {
                htmlTmp[i] += "<td>"+(wojska[i][j]||0);
            }
        }

        if(najwolniejsza != 0){
            let tmp = new Date(czasWejscia);
            tmp.setSeconds(tmp.getSeconds() - najwolniejsza);
            czasWyjscia[ilosc_wiosek]=new Date(tmp);
            let ddd = tmp.getDate() + "." + (tmp.getMonth()+1) + "\u00A0" + tmp.getHours() + ":" + tmp.getMinutes() + ":" + tmp.getSeconds();
            html[ilosc_wiosek] = htmlTmp[i]+"<td>"+ddd+"<td><a href='"+dane.linkDorozkazu+id[i]+"&screen=place&x="+cel[0]+"&y="+cel[1]+mozliwewojska+"'>Wykonaj</a>";
            ilosc_wiosek++;
        }
    }

    if(ilosc_wiosek==0) UI.InfoMessage('Brak jednostek, które zdążą na czas.', 2000, 'error');
    $("#ilosc_mozliwosci").html("<b>"+ilosc_wiosek+"/"+mojeWioski.length+"</b>");

    html.sort((a, b) => czasWyjscia[html.indexOf(a)] - czasWyjscia[html.indexOf(b)]);
    $('#lista_wojska tbody').html(html.join("\n"));
    $("#ladowanie").html("");
    odliczaj();
}

function odliczaj(){
    var t = $('#serverTime').html().match(/\d+/g);
    var d = $('#serverDate').html().match(/\d+/g);
    var obecnyCzas = new Date(d[2],d[1]-1,d[0],t[0],t[1],t[2]);

    $('#lista_wojska tbody>tr').each(function (i) {
        var roznicaSekund = (czasWyjscia[i] - obecnyCzas)/1000;
        $(this).find("td").last().prev().html(formatujCzas(roznicaSekund));
    });

    setTimeout(odliczaj, 1000);
}

function formatujCzas(s){
    var h = Math.floor(s / 3600);
    s -= h * 3600;
    var m = Math.floor(s / 60);
    s = Math.floor(s - m * 60);
    return `${h}:${m<10?"0"+m:m}:${s<10?"0"+s:s}`;
}
