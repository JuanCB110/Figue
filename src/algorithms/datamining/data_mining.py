#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json

# Agregar el path del entorno virtual si es necesario
python_path = os.path.dirname(sys.executable)
if python_path not in sys.path:
    sys.path.append(python_path)

try:
    import pandas as pd
    import numpy as np
    from sklearn.preprocessing import StandardScaler
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
except ImportError as e:
    print(f"Error importando módulos: {e}", file=sys.stderr)
    print(f"Python path: {sys.path}", file=sys.stderr)
    sys.exit(1)

class DataMiningAnalysis:
    def __init__(self, data):
        self.data = pd.DataFrame(data)
        self.scaler = StandardScaler()
        
    def analyze(self, n_clusters=3):
        # Preprocesamiento
        scaled_data = self.scaler.fit_transform(self.data)
        
        # Clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(scaled_data)
        
        # Reducción dimensionalidad para visualización
        pca = PCA(n_components=2)
        reduced_data = pca.fit_transform(scaled_data)
        
        # Crear reporte formateado
        report = []
        report.append("ANÁLISIS DE PATRONES DE ENVÍO")
        report.append("=" * 40)
        report.append("\nDatos de entrada:")
        report.append("-" * 20)
        report.append(str(self.data))
        
        report.append("\nResultados del Clustering:")
        report.append("-" * 25)
        report.append(f"Número de clusters: {n_clusters}")
        
        # Mostrar asignación de clusters
        report.append("\nAsignación de clusters:")
        for i, cluster in enumerate(clusters):
            report.append(f"Registro {i+1}: Cluster {cluster + 1}")
        
        # Mostrar centroides
        report.append("\nCentroides de los clusters:")
        centroids_df = pd.DataFrame(
            kmeans.cluster_centers_,
            columns=[f'Variable {i+1}' for i in range(self.data.shape[1])]
        )
        report.append(str(centroids_df))
        
        # Análisis por cluster
        report.append("\nAnálisis por cluster:")
        for i in range(n_clusters):
            cluster_data = self.data[clusters == i]
            report.append(f"\nCluster {i+1}:")
            report.append(f"Número de registros: {len(cluster_data)}")
            report.append("Estadísticas descriptivas:")
            report.append(str(cluster_data.describe()))
        
        return "\n".join(report)

if __name__ == "__main__":
    try:
        # Leer JSON de entrada
        input_data = json.loads(sys.stdin.read())
        
        analyzer = DataMiningAnalysis(input_data['data'])
        results = analyzer.analyze(input_data.get('n_clusters', 3))
        
        # Imprimir resultados formateados
        print(results)
        
    except Exception as e:
        print(f"Error en el análisis: {str(e)}", file=sys.stderr)
        sys.exit(1) 