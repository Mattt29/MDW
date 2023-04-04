<!DOCTYPE html>
<html>
	<head>
		<title>Films Montpellier</title>
        
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		
        <link rel="stylesheet" href="Leaflet/leaflet.css" /> 
        <script src="Leaflet/leaflet.js"></script>
        <script src="jquery-3.6.4.min.js"></script>

        <link rel="stylesheet" href="Leaflet.markercluster/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="Leaflet.markercluster/dist/MarkerCluster.Default.css" />
        <script src="Leaflet.markercluster/dist/leaflet.markercluster.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.16.9/dist/xlsx.full.min.js"></script>


        <link rel="stylesheet" media="screen" type="text/css" href="style.css"/>
        
	</head>
	<body>
        <h1>Cartographie des films tournés à Montpellier</h1>

        <script type="text/javascript">
            
           /*  const fichier = XLSX.readFile('data/data_tournages_2021_correct.xlsx');

            const feuille = fichier.Sheets[fichier.SheetNames[0]];
            const données = xlsx.utils.sheet_to_json(feuille);

            console.log(données);
 */
 
  fetch('data/data_tournages_2021.json')
        .then(response => response.json())
        .then(data => {
          console.log(data);
          console.log('yo');
        });

        </script>



        <div id="divmap"></div>

        <script type="text/javascript"> 
        fetch('data/data_tournages_2021_correct.xlsx')
  .then(response => response.blob())
  .then(blob => {
    const reader = new FileReader();
    reader.onload = function() {
      const data = new Uint8Array(reader.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      console.log(jsonData);
      console.log(jsonData);
            var map = L.map('divmap');
            map.setView([43.610769 ,3.876716],11);
            L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>', maxZoom:17, minZoom:9}) 
                .addTo(map);

                $.ajax({
                    url: "toponymes_corrigé.geojson",
                    dataType: "json", 
                    success: function(topo){
                        console.log(topo);

                        var filmIcon = L.icon({
                            iconUrl: "film.png",
                            iconSize: [25,25]
                        })

                        var filmLayer = L.geoJson(topo,{ pointToLayer: function(feature,latlng){
                            
                            const colonnesIndices = ["Lieux","infos compl","Genre","Nom_projet","Nombre_jours","debut_tourn","Production","Realisateur"];
                            var idRecherche = feature.id;

                            // Filtrer les lignes correspondantes à l'identifiant recherché
                            const lignesFiltrees = data.tournages_2021.filter(ligne => ligne['id_toponymes'] === idRecherche);

                            // Extraire les valeurs des colonnes souhaitées pour les lignes correspondantes
                            var valeursColonnes = lignesFiltrees.map(ligne => colonnesIndices.map(indice => ligne[indice]));
                            //var valeursColonnes = valeursColonnes.filter(val => val !== '').join('<br>');
                            var popupContent = '';
                            valeursColonnes.forEach(function(valeur, indice) {
                            val = '';
                            console.log(valeur);
                            console.log('valeur');
                            valeur.forEach(function(value,index){
                            val+= colonnesIndices[index] + ':' + value +'</br>';
                            });
                            popupContent += '<p><strong>' + valeursColonnes[indice][3] + ':</strong> ' + val + '</br>' + '</p>';
                            });
                            var marker = L.marker(latlng,{icon: filmIcon});
                            marker.bindPopup(popupContent); //feature.properties.GRAPHIE
                            return marker;
                        }});

                        var clusters = L.markerClusterGroup();
                        clusters.addLayer(filmLayer);
                        map.addLayer(clusters);

                        
                    }
                });

                $.ajax({
                    url: "routes_corrigé.geojson",
                    dataType: "json", 
                    success: function(routes){
                        console.log(routes.features[0]);


                        L.geoJson(routes,{
                            style: function(feature){
                                if (feature.id == 2123){
                                    return {
                                        color : "red",
                                    };
                                }
                                else{
                                    return {
                                        color : "black",
                                    };
                                }

                            }
                        }).addTo(map);                        
                    }
                });

                $.ajax({
                    url: "communes_corrigé.geojson",
                    dataType: "json", 
                    success: function(communes){
                        console.log(communes);

                        L.geoJson(communes,{
                            style: function(feature){
                                return {
                                    opacity : 0.2
                                };
                            }
                        }).addTo(map);                        
                    }
                });

      console.log('yo');
    };
    reader.readAsArrayBuffer(blob);
  });

            
        </script>


	</body>
</html>
