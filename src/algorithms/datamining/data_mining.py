import sys
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

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
        
        return {
            'clusters': clusters.tolist(),
            'centroids': kmeans.cluster_centers_.tolist(),
            'reduced_data': reduced_data.tolist()
        }

if __name__ == "__main__":
    try:
        # Leer JSON de entrada
        input_data = json.loads(sys.stdin.read())
        
        analyzer = DataMiningAnalysis(input_data['data'])
        results = analyzer.analyze(input_data.get('n_clusters', 3))
        
        # Enviar resultados como JSON
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1) 