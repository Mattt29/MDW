function carto() {

    var PATH = "data/"

    var infoArray = [];
    var list_id_communes = [];
    const empty_list = [];
    var communesLayer = null, routesLayer = null, filmLayer = null;

    function addInfo(info) {
        // Fonction qui ajoute les informations au tableau et les affiche dans le div "popup-info"
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
        // Fonction qui supprime les informations du tableau et les réaffiche dans le div "popup-info"
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

    var map = L.map('divmap');
    map.setView([43.610769, 3.876716], 12);

    function update_map(ids_communes, genres) {
        $.ajax({
            url: PATH + "data_tournages_2021.json",
            dataType: "json",
            success: function (data) {

                map.eachLayer(function (layer) {
                    map.removeLayer(layer);
                });

                L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>', maxZoom: 17, minZoom: 9 })
                    .addTo(map);

                var id_topo_to_keep_communes = [];
                var id_topo_to_keep_genres = [];
                var id_topo_to_keep = [];
                var myList = [];
                var filteredList = [];


                if (ids_communes.length != 0) {
                    data.tournages_2021 = data.tournages_2021.filter(ligne => ids_communes.includes(ligne['id_communes']));
                    myList = data.tournages_2021.map(ligne => ligne["id_toponymes"]);
                    filteredList = myList.filter(element => element !== '');
                    id_topo_to_keep_communes = [...new Set(filteredList)];
                }

                if (genres.length != 0) {
                    data.tournages_2021 = data.tournages_2021.filter(ligne => genres.includes(ligne['Genre']));
                    myList = data.tournages_2021.map(ligne => ligne["id_toponymes"]);
                    filteredList = myList.filter(element => element !== '');
                    id_topo_to_keep_genres = [...new Set(filteredList)];
                }

                if (genres.length != 0) {
                    if (ids_communes.length != 0) {
                        for (var i = 0; i < id_topo_to_keep_communes.length; i++) {
                            if (id_topo_to_keep_genres.includes(id_topo_to_keep_communes[i])) {
                                id_topo_to_keep.push(id_topo_to_keep_communes[i]);
                            }
                        }
                    }
                    else {
                        id_topo_to_keep = id_topo_to_keep_genres;
                    }
                }
                else {
                    if (ids_communes.length != 0) {
                        id_topo_to_keep = id_topo_to_keep_communes;
                    }
                }

                $.ajax({
                    url: PATH + "toponymes_corrigé.geojson",
                    dataType: "json",
                    success: function (topo) {

                        if (ids_communes.length != 0 || genres.length != 0) {
                            topo.features = topo.features.filter(ligne => id_topo_to_keep.includes(ligne['id']));
                        }

                        filmLayer = L.geoJson(topo, {
                            pointToLayer: function (feature, latlng) {

                                const colonnesIndices = ["Lieux", "infos compl", "Genre", "Nom_projet", "Nombre_jours", "debut_tourn", "Production", "Realisateur"];
                                var idRecherche = feature.id;
                                var lignesFiltrees = data.tournages_2021.filter(ligne => ligne['id_toponymes'] === idRecherche);
                                var valeursColonnes = lignesFiltrees.map(ligne => colonnesIndices.map(indice => ligne[indice]));
                                var popupContent = '';
                                var name = '';

                                valeursColonnes.forEach(function (valeur, indice) {
                                    val = '';
                                    valeur.forEach(function (value, index) {
                                        if (index == 3) {
                                            name += '<p><strong>' + valeursColonnes[indice][3] + '</strong> ';
                                        }
                                        else {

                                            val += colonnesIndices[index] + ' : ' + value + '</br>';
                                        }
                                    });
                                    popupContent += '<p><strong>' + valeursColonnes[indice][3] + '</strong> ' + '</br>' + val + '</br>' + '</p>';
                                });

                                var tailleBaseIcone = 12;
                                var taillePixelParValeur = 1 / 6;
                                var nombreDeValeurs = valeursColonnes.reduce(function (total, valeur) {
                                    return total + valeur.length;
                                }, 0);
                                var tailleIcone = tailleBaseIcone + nombreDeValeurs * taillePixelParValeur;

                                var filmIcon = L.icon({
                                    iconUrl: "images/Clap_cinema.svg",
                                    iconSize: [tailleIcone, tailleIcone]
                                })

                                var marker = L.marker(latlng, { icon: filmIcon, isSelected: false });

                                marker.on('mouseover', function () {
                                    this.bindTooltip(name).openTooltip();
                                });


                                marker.on('click', function () {
                                    clickedLayer = this
                                    if (!this.isSelected) {
                                        this.isSelected = true;
                                        filmLayer.eachLayer(function (other_layer) {

                                            if (other_layer != clickedLayer && !other_layer.isSelected) {
                                                other_layer.setIcon(L.icon({ iconUrl: "images/clap-cinema_1.svg", iconSize: other_layer.options.icon.options.iconSize }));
                                            }
                                            else if (other_layer == clickedLayer) {
                                                addInfo(popupContent);
                                                other_layer.setIcon(L.icon({ iconUrl: "images/Clap_cinema.svg", iconSize: other_layer.options.icon.options.iconSize }));
                                            }
                                        });

                                    }
                                    else {
                                        this.isSelected = false;
                                        removeInfo(popupContent);
                                        var i = 0;
                                        filmLayer.eachLayer(function (other_layer) {
                                            if (other_layer.isSelected) {
                                                i++;
                                            }
                                        });
                                        if (i == 0) {
                                            filmLayer.eachLayer(function (other_layer) {
                                                other_layer.setIcon(L.icon({ iconUrl: "images/Clap_cinema.svg", iconSize: other_layer.options.icon.options.iconSize }));
                                            });
                                        }
                                        else {
                                            this.setIcon(L.icon({ iconUrl: "images/clap-cinema_1.svg", iconSize: this.options.icon.options.iconSize }));
                                        }

                                    }
                                });
                                return marker;
                            }
                        }).addTo(map);

                        filmLayer.reset = function () {
                            this.eachLayer(function (layer) {
                                if (layer.isSelected) {
                                    layer.isSelected = false;;
                                }
                                layer.setIcon(L.icon({ iconUrl: "images/Clap_cinema.svg", iconSize: layer.options.icon.options.iconSize }));
                            });
                        };

                    }
                });



                $.ajax({
                    url: PATH + "communes_corrigé.geojson",
                    dataType: "json",
                    success: function (communes) {

                        if (ids_communes.length != 0) {
                            communes.features = communes.features.filter(ligne => ids_communes.includes(ligne['id']));
                        }
                        communesLayer = L.geoJson(communes, {

                            style: function (feature) {
                                return {
                                    fillOpacity: 0.1,
                                    color: "#72CBF0",
                                    weight: 1,
                                    highlight: {
                                        weight: 4,
                                        dashArray: ''
                                    }
                                };
                            },
                            onEachFeature: function (feature, layer) {

                                layer.options.originalStyle = layer.options.style(feature);
                                layer.on({
                                    click: function (e) {
                                        var layer = e.target;
                                        var id_selected = layer.feature.properties.OBJECTID;


                                        if (layer._path.classList.contains('clicked')) {
                                            const index = list_id_communes.indexOf(id_selected);
                                            if (index !== -1) {
                                                list_id_communes.splice(index, 1);
                                            }
                                            layer.setStyle(layer.options.highlight);
                                            layer._path.classList.remove('clicked');

                                        } else {
                                            if (!list_id_communes.includes(id_selected)) {
                                                list_id_communes.push(id_selected);
                                            }
                                            layer.options.originalStyle = layer.options.style;
                                            layer.setStyle(layer.options.highlight);
                                            layer._path.classList.add('clicked');
                                        }
                                        draw(e, data, list_id_communes);
                                    },
                                    mouseover: function (e) {
                                        var layer = e.target;
                                        layer.setStyle(layer.options.highlight);
                                    },
                                    mouseout: function (e) {
                                        var layer = e.target;
                                        if (!layer._path.classList.contains('clicked')) {
                                            layer.setStyle(layer.options.style(feature));
                                        }
                                    },
                                });
                            }
                        }).addTo(map);

                        communesLayer.bringToBack();
                    }
                });

                $.ajax({
                    url: PATH + "routes_corrigé.geojson",
                    dataType: "json",
                    success: function (routes) {

                        routesLayer = L.geoJson(routes, {

                            onEachFeature: function (feature, layer) {

                                const colonnesIndices = ["Lieux", "infos compl", "Genre", "Nom_projet", "Nombre_jours", "debut_tourn", "Production", "Realisateur"];
                                var idRecherche = feature.id;
                                const lignesFiltrees = data.tournages_2021.filter(ligne => ligne['id_routes_nommees'] === idRecherche);
                                var valeursColonnes = lignesFiltrees.map(ligne => colonnesIndices.map(indice => ligne[indice]));
                                var popupContent = '';
                                var name = '';

                                valeursColonnes.forEach(function (valeur, indice) {
                                    val = '';
                                    valeur.forEach(function (value, index) {

                                        if (index == 3) {
                                            name += '<p><strong>' + valeursColonnes[indice][3] + '</strong> '
                                        }
                                        else {
                                            val += colonnesIndices[index] + ' : ' + value + '</br>';
                                        }
                                    });
                                    popupContent += '<p><strong>' + valeursColonnes[indice][3] + '</strong> ' + '</br>' + val + '</br>' + '</p>';
                                });

                                layer.on('mouseover', function () {
                                    this.bindTooltip(name).openTooltip();
                                });
                                
                                layer.on('click', function (e) {
                                    var layer = e.target;
                                    var clickedLayer = e.target;

                                    if (layer._path.classList.contains('clicked')) {
                                        removeInfo(popupContent);
                                        layer._path.classList.remove('clicked');
                                        var i = 0;
                                        routesLayer.eachLayer(function (other_layer) {
                                            if (other_layer._path.classList.contains('clicked')) {
                                                i++;
                                            }
                                        });

                                        if (i == 0) {
                                            routesLayer.eachLayer(function (other_layer) {
                                                other_layer.setStyle(other_layer.options.Clicked);
                                            });
                                        }
                                        else {
                                            layer.setStyle(layer.options.notClicked);
                                        }

                                    } else {
                                        routesLayer.eachLayer(function (other_layer) {
                                            if (other_layer !== clickedLayer && !other_layer._path.classList.contains('clicked')) {
                                                other_layer.setStyle(other_layer.options.notClicked);
                                            } else if (other_layer == clickedLayer) {
                                                addInfo(popupContent);
                                                layer._path.classList.add('clicked');
                                                layer.setStyle(layer.options.Clicked);
                                            }
                                        });
                                    }


                                });

                            },
                            style: function (feature) {
                                const idRecherche = feature.id;
                                const lignes = data.tournages_2021.filter(ligne => ligne['id_routes_nommees'] == idRecherche);
                                var nbValeurs = lignes.length;
                                return {
                                    color: "orange",
                                    weight: nbValeurs * 2,
                                    opacity: 0.8,
                                    Clicked: {
                                        color: "orange",
                                        opacity: 0.8
                                    },
                                    notClicked: {
                                        color: "gray",
                                        opacity: 0.5
                                    }
                                };
                            }
                        }).addTo(map);

                        routesLayer.reset = function () {
                            this.eachLayer(function (layer) {

                                if (layer._path.classList.contains('clicked')) {
                                    layer._path.classList.remove('clicked');
                                }
                                layer.setStyle(layer.options.Clicked);
                            });
                        };

                    }
                });
            }
        });
    };

    update_map(empty_list, empty_list);

    $('#select-communes').select2({
        placeholder: 'Sélectionner les communes à afficher',
        allowClear: false
    });

    var selectCommunes = [];
    var selectGenre = []

    $('#select-communes').change(function () {

        if (!$('#toponymes').prop('checked')) {
            $('#toponymes').prop('checked', true);
        }
        if (!$('#routes').prop('checked')) {
            $('#routes').prop('checked', true);
        }
        if (!$('#communes').prop('checked')) {
            $('#communes').prop('checked', true);
        }
        var selectElement = document.getElementById("select-communes");
        var selectedOptions = [];
        for (var i = 0; i < selectElement.selectedOptions.length; i++) {
            selectedOptions.push(parseInt(selectElement.selectedOptions[i].value));
        }
        selectCommunes = selectedOptions;

        update_map(selectCommunes, selectGenre);
    });

    window.empty_div = function empty_div() {
        document.getElementById('popup-info').innerHTML = 'Cliquer sur un marqueur pour afficher les informations';
        infoArray = [];
        routesLayer.reset();
        filmLayer.reset();
    }

    $('#select-genres').select2({
        placeholder: 'Sélectionner les genres à afficher',
        allowClear: false
    });

    $('#select-genres').change(function () {

        if (!$('#toponymes').prop('checked')) {
            $('#toponymes').prop('checked', true);
        }
        if (!$('#routes').prop('checked')) {
            $('#routes').prop('checked', true);
        }
        if (!$('#communes').prop('checked')) {
            $('#communes').prop('checked', true);
        }
        var selectElement = document.getElementById("select-genres");
        var selectedOptions = [];
        for (var i = 0; i < selectElement.selectedOptions.length; i++) {
            selectedOptions.push(selectElement.selectedOptions[i].value);
        }
        selectGenre = selectedOptions;

        update_map(selectCommunes, selectGenre);
    });

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


    $('#toponymes').change(function () {
        showToponymes();
    });

    $('#routes').change(function () {
        showRoutes();
    });

    $('#communes').change(function () {
        showCommunes();
    });

    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += '<div style="display:flex; align-items:center;"><img src="images/Clap_cinema.svg" width="13" height="13"><div style="background-color: orange; height: 5px; border-radius: 10px; margin: 10px 0; width: ' + 40 + 'px; height: 6px; opacity :0.8;margin-right: 5px;margin-left: 5px;"></div><span>1 tournage</span></div>';
        div.innerHTML += '<div style="display:flex; align-items:center;"><img src="images/Clap_cinema.svg" width="20" height="20"><div style="background-color: orange; height: 5px; border-radius: 10px; margin: 10px 0; width: ' + 40 + 'px; height: 13px;opacity :0.8; margin-right: 5px;margin-left: 5px;"></div><span>2 - 10 tournages</span></div>';
        div.innerHTML += '<div style="display:flex; align-items:center;"><img src="images/Clap_cinema.svg" width="27" height="27"><div style="background-color: orange; height: 5px; border-radius: 10px; margin: 10px 0; width: ' + 40 + 'px; height: 23px;opacity :0.8; margin-right: 5px;margin-left: 5px;"></div><span>+10 tournages</span></div>';

        return div;
    };

    legend.addTo(map);
    L.control.scale({ position: "bottomright" }).addTo(map);

    $.ajax({
        url: PATH + "data_tournages_2021.json",
        dataType: "json",
        success: function (data) {
            var total = 0, complet = 0, partiel = 0, manquant = 0;

            data.tournages_2021.forEach(function (d) {
                total++;
                if (d.id_toponymes && d.id_routes_nommees) complet++;
                else if (d.id_routes_nommees || d.id_toponymes) partiel++;
                else manquant++;
            });

            var margin = { top: 10, right: 0, bottom: 30, left: 0 },
                width = 2500 - margin.left - margin.right,
                height = 250 - margin.top - margin.bottom;

            var svg = d3.select("#visu_cartho")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            var scale = d3.scaleLinear()
                .domain([0, complet + partiel + manquant])
                .range([0, document.getElementById("visu_cartho").clientWidth]);

            function updateScaleRange() {
                scale.range([0, document.getElementById("visu_cartho").clientWidth]);
                draw(0, data, list_id_communes);
            }

            window.addEventListener('resize', updateScaleRange);

            draw(0, data, []);

        }


    });

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

            var svgExist = d3.select("#visu_cartho svg").size() > 0;
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

            if (list_id_communes.length == 0) {
                svg.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .text("Affichage des données de toutes les communes")
                    .style("font-weight", "bold");
            }

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
}