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

function showToponymes() {

    if ($('#toponymes').prop('checked')) {
        filmLayer.addTo(map);

    } else {
        map.removeLayer(filmLayer);

    }
}

function showRoutes() {

    if ($('#routes').prop('checked')) {
        routesLayer.addTo(map);
    } else {
        map.removeLayer(routesLayer);
    }
}

function showCommunes() {

    if ($('#communes').prop('checked')) {
        communesLayer.addTo(map);
        communesLayer.bringToBack();
    } else {
        map.removeLayer(communesLayer);
    }
}

function draw(e, data, list_id_communes) {

    
    e = e.target;

    var lignesFiltrees = 0;
    var total = 0, complet = 0, partiel = 0, manquant = 0;

    if (list_id_communes.length != 0) {

        lignesFiltrees = data.tournages_2021.filter(ligne => list_id_communes.includes(ligne['id_communes']));

        lignesFiltrees.forEach(function (d) {
            if (list_id_communes.includes(d.id_communes)) {
                total++;
                if (d.id_toponymes && d.id_routes_nommees) complet++;
                else if (d.id_routes_nommees || d.id_toponymes) partiel++;
                else manquant++;
            }
        });


    }

    else {
        const idCommunesUniques = [...new Set(data.tournages_2021.map(item => item.id_communes))];

        lignesFiltrees = data.tournages_2021;

        lignesFiltrees.forEach(function (d) {
            if (idCommunesUniques.includes(d.id_communes)) {
                total++;
                if (d.id_toponymes && d.id_routes_nommees) complet++;
                else if (d.id_routes_nommees || d.id_toponymes) partiel++;
                else manquant++;
            }
        });
    }

    var margin = { top: 10, right: 0, bottom: 30, left: 0 },
        width = 2500 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    var scale = d3.scaleLinear()
        .domain([0, complet + partiel + manquant])
        .range([0, document.getElementById("visu_cartho").clientWidth]);

    function updateScaleRange() {
        scale.range([0, document.getElementById("visu_cartho").clientWidth]);
        update_graphique();
    }

    window.addEventListener('resize', updateScaleRange);

    function update_graphique() {

        // Vérifier si un SVG existe déjà
        var svgExist = d3.select("#visu_cartho svg").size() > 0;

        // Si un SVG existe déjà, le supprimer
        if (svgExist) {
            d3.select("#visu_cartho svg").remove();
        }

        var svg = d3.select("#visu_cartho")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        var scale = d3.scaleLinear()
            .domain([0, complet + partiel + manquant])
            .range([0, document.getElementById("visu_cartho").clientWidth]);

        svg.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text("Affichage des données de toutes les communes")
            .style("font-weight", "bold");

        if (complet != 0) {
            svg.append("rect")
                .attr("x", 0)
                .attr("y", 5)
                .attr("width", scale(complet))
                .attr("height", 50)
                .style("fill", "#6ec4a9")
                .attr("position", "relative");

            svg.append("text")
                .attr("x", scale(complet) / 2)
                .attr("y", 35)
                .text(complet)
                .style("font-weight", "bold");

        }



        if (partiel != 0) {
            svg.append("rect")
                .attr("x", scale(complet) + 1)
                .attr("y", 5)
                .attr("width", scale(partiel))
                .attr("height", 50)
                .style("fill", "#ff9446");

            svg.append("text")
                .attr("x", scale(complet) + scale(partiel) / 2)
                .attr("y", 35)
                .text(partiel)
                .style("font-weight", "bold");

        }


        if (manquant != 0) {
            svg.append("rect")
                .attr("x", scale(complet + partiel) + 2)
                .attr("y", 5)
                .attr("width", scale(manquant))
                .attr("height", 50)
                .style("fill", "#ef5858");



            svg.append("text")
                .attr("x", scale(complet + partiel) + scale(manquant) / 2)
                .attr("y", 35)
                .text(manquant)
                .style("font-weight", "bold");
        }


        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(0," + (height + margin.bottom - 180) + ")");

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "#6ec4a9");

        legend.append("text")
            .attr("x", 30)
            .attr("y", 15)
            .text("Lieu et route présents");

        legend.append("rect")
            .attr("x", 180)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "#ff9446");

        legend.append("text")
            .attr("x", 210)
            .attr("y", 15)
            .text("Lieu ou route présent");

        legend.append("rect")
            .attr("x", 360)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "#ef5858");

        legend.append("text")
            .attr("x", 390)
            .attr("y", 15)
            .text("Lieu et route manquants");

        svg.append("text")
            .attr("x", scale((complet + partiel + manquant) * 0.8))
            .attr("y", 1)
            .text("Total : " + (complet + partiel + manquant) + " tournages sélectionnés")
            .style("font-size", "14px")
            .style("font-weight", "bold");
    }

    update_graphique();


};