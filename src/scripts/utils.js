

function addInfo(info) {

    infoArray.push(info);


    var popupInfo = document.getElementById("popup-info");
    popupInfo.innerHTML = '<button id="croix" onclick="empty_div()">X</button>';

    for (var i = 0; i < infoArray.length; i++) {
        if (i == 0) {
            popupInfo.innerHTML += infoArray[i] + '<button id="croix" onclick="empty_div()">X</button>' + '<br>';
        }
        else {
            popupInfo.innerHTML += infoArray[i] + '<br>';
        }
    }
}

function removeInfo(info) {

    var index = infoArray.indexOf(info);

    if (index !== -1) {
        infoArray.splice(index, 1);
    }


    var popupInfo = document.getElementById("popup-info");
    popupInfo.innerHTML = '<button id="croix" onclick="empty_div()">X</button>';
    if (infoArray.length == 0) {
        popupInfo.innerHTML = 'Cliquer sur un marqueur pour afficher les informations';
    }
    else {
        popupInfo.innerHTML = '<button id="croix" onclick="empty_div()">X</button>';
        for (var i = 0; i < infoArray.length; i++) {
            popupInfo.innerHTML += infoArray[i] + "<br>";
        }
    }
}


function empty_div() {
    document.getElementById('popup-info').innerHTML = 'Cliquer sur un marqueur pour afficher les informations';
    infoArray = [];
    routesLayer.reset();
    filmLayer.reset();
}

function infos_tournage(feature, data, niveau) {
    const colonnesIndices = ["Lieux", "infos compl", "Genre", "Nom_projet", "Nombre_jours", "debut_tourn", "Production", "Realisateur"];
    var idRecherche = feature.id;

    const lignesFiltrees = data.tournages_2021.filter(ligne => ligne[niveau] === idRecherche);

    var valeursColonnes = lignesFiltrees.map(ligne => colonnesIndices.map(indice => ligne[indice]));

    var popupContent = '';
    var name = '';
    valeursColonnes.forEach(function (valeur, indice) {
        val = '';

        valeur.forEach(function (value, index) {
            val += colonnesIndices[index] + ' : ' + value + '</br>';
        });
        name += '<p><strong>' + valeursColonnes[indice][3] + '</strong> ';
        if (indice == 0) {
            popupContent += '<p><strong>' + valeursColonnes[indice][3] + '</strong> ' + '<button onclick="empty_div()">X</button>' + '</br>' + val + '</br>' + '</p>';

        }
        else {
            popupContent += '<p><strong>' + valeursColonnes[indice][3] + '</strong> ' + '</br>' + val + '</br>' + '</p>';
        }
    });
    return [name, popupContent, valeursColonnes]
}