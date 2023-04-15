function carto() {
    var PATH = "data/"
    $.ajax({
        url: PATH + "ancien_geojson/routes_nommées_FeaturesToJSO.geojson",
        dataType: "json",
        success: function (data) {


        }
    });
    // Création du tableau pour stocker les informations
    var infoArray = [];

    // Fonction qui ajoute les informations au tableau et les affiche dans le div "popup-info"
    function addInfo(info) {
        // Ajout des informations au tableau
        infoArray.push(info);

        // Affichage des informations dans le div "popup-info"
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

    // Fonction qui supprime les informations du tableau et les réaffiche dans le div "popup-info"
    function removeInfo(info) {
        // Suppression des informations du tableau
        var index = infoArray.indexOf(info);

        if (index !== -1) {
            infoArray.splice(index, 1);
        }

        // Réaffichage des informations restantes dans le div "popup-info"
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
    var PATH = "data/"

    const empty_list = [];
    var communesLayer = null, routesLayer = null, filmLayer = null;

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

                    // Utiliser Set() pour supprimer les doublons
                    id_topo_to_keep_communes = [...new Set(filteredList)];

                }

                if (genres.length != 0) {
                    data.tournages_2021 = data.tournages_2021.filter(ligne => genres.includes(ligne['Genre']));
                    myList = data.tournages_2021.map(ligne => ligne["id_toponymes"]);
                    filteredList = myList.filter(element => element !== '');

                    // Utiliser Set() pour supprimer les doublons
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

                                // Filtrer les lignes correspondantes à l'identifiant recherché
                                var lignesFiltrees = data.tournages_2021.filter(ligne => ligne['id_toponymes'] === idRecherche);

                                // Extraire les valeurs des colonnes souhaitées pour les lignes correspondantes
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

                                marker.on('mouseover', function (e) {
                                    this.bindTooltip(name).openTooltip();
                                });

                                // Afficher un div avec les informations du tournage lorsqu'on clique sur le marqueur
                                marker.on('click', function (e) {
                                    //document.getElementById("popup-info").innerHTML = popupContent;
                                    /* this.setIcon(L.icon({
                                    iconUrl: PATH + "Clap_cinema.svg",
                                    iconSize: [tailleIcone, tailleIcone], className: 'film-icon'
                                    
                                })); */
                                    clickedLayer = this
                                    if (!this.isSelected) {
                                        this.isSelected = true;
                                        filmLayer.eachLayer(function (other_layer) {

                                            if (other_layer != clickedLayer && !other_layer.isSelected) {
                                                other_layer.setIcon(L.icon({ iconUrl: PATH + "clap-cinema_1.svg" }));
                                            }
                                            else if (other_layer == clickedLayer) {
                                                addInfo(popupContent);
                                                other_layer.setIcon(L.icon({ iconUrl:  "images/Clap_cinema.svg" }));

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

                                                other_layer.setIcon(L.icon({ iconUrl: "images/Clap_cinema.svg" }));
                                            });
                                        }
                                        else {
                                            this.setIcon(L.icon({ iconUrl: PATH + "clap-cinema_1.svg" }));
                                        }
                                        //this.setIcon(L.icon({ iconUrl: PATH + "Clap_cinema.svg", iconSize: [tailleIcone, tailleIcone] }));
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
                                layer.setIcon(L.icon({ iconUrl: "images/Clap_cinema.svg" }));
                            });
                        };

                    }
                });



                $.ajax({
                    url: PATH + "communes_corrigé.geojson",
                    dataType: "json",
                    success: function (communes) {

                        var list_id_communes = [];

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


                                const colonnesIndices = ["id_communes", "Lieux", "infos compl", "Genre", "Nom_projet", "Nombre_jours", "debut_tourn", "Production", "Realisateur"];
                                var idRecherche = feature.id;
                                const lignesFiltrees = data.tournages_2021.filter(ligne => ligne['id_communes'] === idRecherche);

                                /* var numTournages = lignesFiltrees.length;

                                var string = ' tournages';
                                if (numTournages == 1) {
                                    var string = ' tournage';
                                }
                                layer.bindPopup(feature.properties.NOM + ' : ' + numTournages + string); */

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
                                        //layer.setStyle(originalStyle);

                                        if (!layer._path.classList.contains('clicked')) {
                                            layer.setStyle(layer.options.style(feature));
                                        }
                                    },

                                });

                            }
                        }).addTo(map);




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

                                // Filtrer les lignes correspondantes à l'identifiant recherché
                                const lignesFiltrees = data.tournages_2021.filter(ligne => ligne['id_routes_nommees'] === idRecherche);

                                // Extraire les valeurs des colonnes souhaitées pour les lignes correspondantes
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
                                // Appliquer la ligne "document.getElementById("popup-info").innerHTML = popupContent;" lorsque la route est cliquée
                                layer.on('click', function (e) {
                                    //document.getElementById("popup-info").innerHTML = popupContent;
                                    var layer = e.target;
                                    var clickedLayer = e.target;


                                    if (layer._path.classList.contains('clicked')) {
                                        removeInfo(popupContent);

                                        //layer.setStyle(layer.options.style(feature));

                                        //clickedLayer.setStyle(clickedLayer.options.notClicked);
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
                                        //layer.options.originalStyle = layer.options.style;
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
                            this.eachLayer(function (alayer) {

                                if (alayer._path.classList.contains('clicked')) {
                                    alayer._path.classList.remove('clicked');
                                }
                                alayer.setStyle(alayer.options.Clicked);
                            });
                        };

                    }
                });



            }
        });

    };


    update_map(empty_list, empty_list);

    // Initialiser Select2 sur l'élément select
    $('#select-communes').select2({
        placeholder: 'Sélectionner les communes à afficher',
        allowClear: false


    });

    var selectCommunes = [];
    var selectGenre = []

    $('#select-communes').change(function () {
        // Récupérer l'élément select
        var selectElement = document.getElementById("select-communes");
        // Récupérer les options sélectionnées
        var selectedOptions = [];
        for (var i = 0; i < selectElement.selectedOptions.length; i++) {
            selectedOptions.push(parseInt(selectElement.selectedOptions[i].value));
        }

        selectCommunes = selectedOptions;

        // Mettre à jour la map
        update_map(selectCommunes, selectGenre);

    });

    $('#select-genres').select2({
        placeholder: 'Sélectionner les genres à afficher',
        allowClear: false

    });

    $('#select-genres').change(function () {
        // Récupérer l'élément select
        var selectElement = document.getElementById("select-genres");
        // Récupérer les options sélectionnées
        var selectedOptions = [];
        for (var i = 0; i < selectElement.selectedOptions.length; i++) {
            selectedOptions.push(selectElement.selectedOptions[i].value);
        }

        selectGenre = selectedOptions;

        // Mettre à jour la map
        update_map(selectCommunes, selectGenre);

    });


    $('#toponymes').change(function () {
        showToponymes();
    });

    $('#routes').change(function () {
        showRoutes();
    });

    $('#communes').change(function () {
        showCommunes();
    });

    /*Legend specific*/
    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        //div.innerHTML += "<h4>Légende</h4>";
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

        }


    });

}