import pandas as pd
import json

file = 'data/data_tournages_2021_correct.xlsx'
tournages = pd.read_excel(file)
tournages['id_toponymes'] = tournages['id_toponymes'].fillna(-1).astype(int)
tournages['id_routes_nommees'] = tournages['id_routes_nommees'].fillna(-1).astype(int)
tournages['id_communes'] = tournages['id_communes'].fillna(-1).astype(int)

liste_toponymes = tournages['id_toponymes'].unique().tolist()
liste_routes = tournages['id_routes_nommees'].unique().tolist()
liste_communes = tournages['id_communes'].unique().tolist()


toponymes_file = 'data/ancien_geojson/TOPONYME_Clip__FeaturesToJSO.geojson'
routes_file = 'data/ancien_geojson/routes_nommées_FeaturesToJSO.geojson'
communes_file = 'data/ancien_geojson/COMMUNE_Clip_P_FeaturesToJSO.geojson'

with open(toponymes_file, 'r', encoding='utf-8') as f:
    toponymes = json.load(f)
    
with open(routes_file, 'r', encoding='utf-8') as f:
    routes = json.load(f)

with open(communes_file, 'r', encoding='utf-8') as f:
    communes = json.load(f)

listes_features = [toponymes, routes, communes]
listes_noms = ['toponymes', 'routes', 'communes']
listes_a_garder = [liste_toponymes, liste_routes, liste_communes]

for features, nom, liste in zip(listes_features, listes_noms, listes_a_garder):
    kept_data = []
    for feature in features['features']:
        if feature['id'] in liste:
            kept_data.append(feature)

    new_data = {
        "type": "FeatureCollection",
        "features": kept_data
    }
    
    nom_fichier = nom + '_corrigé.geojson'

    with open(nom_fichier, 'w', encoding="utf-8") as f:
        json.dump(new_data, f, ensure_ascii=False)