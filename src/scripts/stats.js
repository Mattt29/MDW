function stats() {


    d3.json("data/tournages_annee.json").then(function (data) {
        // Données
        var tournages_par_annee = {};

        // Pour chaque tournage dans les données, ajouter le nombre de tournages pour l'année correspondante
        data.forEach(function (d) {
            var annee = d.annee;
            if (tournages_par_annee[annee] === undefined) {
                tournages_par_annee[annee] = 1;
            } else {
                tournages_par_annee[annee] += 1;
            }
        });

        // Convertir les données en tableau pour D3
        var tournages_par_annee_array = [];
        for (var annee in tournages_par_annee) {
            tournages_par_annee_array.push({ annee: annee, nombre: tournages_par_annee[annee] });
        }

        // Ordonner les années en fonction des critères donnés
        var annees_speciales = ['1938-2007', '2008-2009', '2009-2010'];
        tournages_par_annee_array.sort(function (a, b) {
            var aSpecial = annees_speciales.indexOf(a.annee) !== -1;
            var bSpecial = annees_speciales.indexOf(b.annee) !== -1;
            if (aSpecial && bSpecial) {
                return annees_speciales.indexOf(a.annee) - annees_speciales.indexOf(b.annee);
            } else if (aSpecial) {
                return -1;
            } else if (bSpecial) {
                return 1;
            } else {
                return parseInt(a.annee) - parseInt(b.annee);
            }
        });

        // Dimensions
        var margin = { top: 50, right: 50, bottom: 50, left: 0 },
            width = 1200 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        // Echelle pour les axes
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        var y = d3.scaleLinear()
            .range([height, 0]);

        // Créer le SVG
        var svg = d3.select("#diag").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Charger les données
        x.domain(tournages_par_annee_array.map(function (d) { return d.annee; }));
        y.domain([0, d3.max(tournages_par_annee_array, function (d) { return d.nombre; })]);

        // Ajouter les barres
        var bars = svg.selectAll(".bar")
            .data(tournages_par_annee_array)
            .enter().append("g")
            .attr("class", "bar-group")
            .attr("transform", function (d) { return "translate(" + x(d.annee) + ",0)"; });

        bars.append("rect")
            .attr("class", "bar")
            .attr("width", x.bandwidth())
            .attr("y", function (d) { return y(d.nombre); })
            .attr("height", function (d) { return height - y(d.nombre); })
            .attr("fill", "teal")
            .on("click", function (d) {
                // Code à exécuter lorsqu'on clique sur la barre
                annee = d.explicitOriginalTarget.__data__.annee;

            });

        bars.append("text")
            .attr("class", "bar-text")
            .attr("x", x.bandwidth() / 2)
            .attr("y", function (d) { return y(d.nombre) - 5; })
            .attr("text-anchor", "middle")
            .text(function (d) { return d.nombre; });

        svg.selectAll(".bar-group")
            .append("text")
            .attr("class", "bar-text")
            .attr("x", x.bandwidth() / 2)
            .attr("y", function (d) { return y(d.nombre) - 5; })
            .attr("text-anchor", "middle")
            .text(function (d) { return d.nombre; });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Années");

        // utiliser reduce() pour compter le nombre de chaque Type dans les données
        var anneeCounts = data.reduce(function (obj, e) {
            if (!obj[e.annee]) {
                obj[e.annee] = 0;
            }
            obj[e.annee]++;
            return obj;
        }, {});

        var nb_tournages = Object.values(anneeCounts).reduce(function (sum, count) {
            return sum + count;
        }, 0);

        var anneeData = [];
        Object.keys(anneeCounts).forEach(function (annee) {
            anneeData.push({
                label: annee,
            });
        });

        anneeData.sort(function (a, b) {
            return a.label.localeCompare(b.label);
        });

        let types = new Set();
        for (let obj of data) {
            types.add(obj.Type);
        }
        let nb_types = types.size;

        //Vérifier que le label des titres dans le json d'Enzo soit bien correct entre 1936 et 20019 par rapport à 2020/2021

        let titres = new Set();
        for (let obj of data) {
            titres.add(obj.Titre);
        }
        let nb_titres = titres.size;

        //Vérifier que le label des producteurs dans le json d'Enzo soit bien correct entre 1936 et 20019 par rapport à 2020/2021
        let produc = new Set();
        for (let obj of data) {
            produc.add(obj.Production);
        }
        let nb_produc = produc.size;

        introduction = "<p> Voici l'onglet statistique présentant les données des tournages aillant lieu à Montpellier et ses alentours. Il considère les années <strong>"
            + anneeData[0].label
            + "</strong> jusqu'à <strong>"
            + anneeData[anneeData.length - 1].label
            + "</strong>. Il a été recensé <strong>"
            + nb_tournages
            + "</strong> tournages correspondant à <strong>"
            + nb_titres
            + "</strong> projets différents produits par <strong>"
            + nb_produc
            + "</strong> producteurs différents. Ces tournages sont représentés au sein de <strong>"
            + nb_types
            + "</strong> types différents.</p>";

        document.getElementById("intro").innerHTML = introduction;


        var buttons = d3.select("#divbouton")
            .selectAll("button")
            .data(anneeData)
            .enter()
            .append("button")
            .text(function (d) { return d.label; })
            .attr("class", "btn btn-primary")
            .style("width", "73.4px")
            .style("margin-right", "4px")
            .style("margin-left", "4px")
            .style("padding", "0px");

        // créer la svg
        var svg = d3.select("#statistiques")
            .append("svg")
            .attr("width", "1100px")
            .attr("height", "700px")
            .attr("margin-top", "400px");

        // créer un groupe pour les camemberts
        var pieGroup = svg.append("g")
            .attr("transform", "translate(450,350)");

        // créer un groupe pour les labels d'année
        var labelGroup = svg.append("g")
            .attr("transform", "translate(450,350)");

        // créer un groupe pour la légende
        var legendGroup = svg.append("g")
            .attr("transform", "translate(700,150)");

        // fonction pour dessiner le camembert
        function drawPieChart(data, label) {
            // calculer les comptes de type
            var typeCounts = Object.assign({}, {});
            var typeCounts = data.reduce(function (obj, d) {
                if (!obj[d.Type] && d.annee == label) {
                    obj[d.Type] = 0;
                }
                if (d.annee == label) {
                    obj[d.Type]++;
                }
                return obj;
            }, {});
            // supprimer les valeurs NaN
            typeCounts = Object.fromEntries(
                Object.entries(typeCounts).filter(function ([type, count]) {

                    return count > 0;
                })
            );


            // créer un tableau de données pour le camembert
            var pieData = [];
            Object.keys(typeCounts).forEach(function (type) {
                pieData.push({
                    label: type,
                    value: typeCounts[type]
                });
            });

            // On trie l'array en ordre décroissant des valeurs
            pieData.sort((a, b) => b.value - a.value);

            // On récupère les 9 premiers objets
            const topNine = pieData.slice(0, 9);

            // On somme les valeurs des objets restants
            const otherValue = pieData.slice(9).reduce((acc, curr) => acc + curr.value, 0);

            // On crée un nouvel objet pour les autres valeurs
            const otherObject = { label: "Autre", value: otherValue };

            // On combine les deux tableaux pour avoir un tableau final avec les 9 objets les plus élevés et l'objet Autre
            const newPieData = [...topNine, otherObject];

            var pie = d3.pie()
                .value(function (d) { return d.value; });
            var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(200);

            var colors = d3.scaleOrdinal(d3.schemeTableau10);

            var arcs = pieGroup.selectAll(".arc")
                .data(pie(newPieData))
                .enter()
                .append("g")
                .attr("class", "arc");

            arcs.append("path")
                .attr("d", arc)
                .attr("fill", function (d) { return colors(d.data.label); });

            arcs.append("text")
                .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
                .attr("text-anchor", "middle")
                .text(function (d) {
                    var percentage = Math.round(100 * d.data.value / d3.sum(newPieData, function (d) { return d.value; }));
                    return percentage + "%";

                });



            // ajouter le label d'année correspondant
            labelGroup.append("text")
                .attr("class", "year-label")
                .attr("text-anchor", "middle")
                .attr("y", -250)
                .text("Nombre de tournages en fonction du Type à l'année " + label);



            // ajouter un élément rectangulaire et un texte pour chaque type de données dans le camembert
            var legend = legendGroup.selectAll(".legend")
                .data(newPieData)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) { return "translate(0," + i * 30 + ")"; });

            legend.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", function (d) { return colors(d.label); });


            legend.append("text")
                .attr("x", 30)
                .attr("y", 10)
                .attr("dy", ".35em")
                .text(function (d) { return d.label + " (" + d.value + ")"; });



        }

        // dessiner le camembert par défaut pour l'année 2019
        drawPieChart(data, "2021");

        // ajouter un événement clic pour chaque bouton
        buttons.on("click", function (d, e) {
            // supprimer le camembert et le label d'année précédents
            pieGroup.selectAll("*").remove();
            labelGroup.selectAll("*").remove();
            legendGroup.selectAll("*").remove();

            // dessiner le nouveau camembert
            drawPieChart(data, e.label);
        });





    });

}