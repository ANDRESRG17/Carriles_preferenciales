import geopandas as gpd
import json
import os

def convert_shapefile_to_geojson():
    """Convierte el shapefile de carriles preferenciales a GeoJSON"""
    
    # Ruta del shapefile
    shapefile_path = "Shape_carril_preferencial/CP2025_NS_EW_Merge.shp"
    
    try:
        print(f"Leyendo shapefile desde: {shapefile_path}")
        
        # Leer el shapefile
        gdf = gpd.read_file(shapefile_path)
        
        print(f"Shapefile leído exitosamente. Columnas: {list(gdf.columns)}")
        print(f"Número de features: {len(gdf)}")
        print(f"CRS: {gdf.crs}")
        
        # Mostrar las primeras filas para entender la estructura
        print("\nPrimeras 3 filas:")
        print(gdf.head(3))
        
        # Convertir a WGS84 (EPSG:4326) si no está en ese sistema
        if gdf.crs != 'EPSG:4326':
            print("\nConvirtiendo a WGS84 (EPSG:4326)...")
            gdf = gdf.to_crs('EPSG:4326')
            print(f"Nuevo CRS: {gdf.crs}")
        
        # Crear GeoJSON usando el método to_json() de GeoDataFrame
        print("\nConvirtiendo a GeoJSON...")
        geojson_string = gdf.to_json()
        geojson_data = json.loads(geojson_string)
        
        # Guardar GeoJSON
        output_path = "carriles_preferenciales.geojson"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(geojson_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ GeoJSON guardado exitosamente en: {output_path}")
        print(f"Total de features: {len(geojson_data['features'])}")
        
        # Mostrar ejemplo de un feature
        if geojson_data["features"]:
            print("\nEjemplo de feature:")
            example = geojson_data["features"][0]
            print(f"Propiedades: {list(example['properties'].keys())}")
            print(f"Tipo de geometría: {example['geometry']['type']}")
            
            # Mostrar las coordenadas del primer feature
            if 'coordinates' in example['geometry']:
                coords = example['geometry']['coordinates']
                print(f"Primeras coordenadas: {coords[:2] if len(coords) > 1 else coords}")
        
        return output_path
        
    except Exception as e:
        print(f"❌ Error convirtiendo shapefile: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    convert_shapefile_to_geojson()
