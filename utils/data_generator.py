import numpy as np
from sklearn.datasets import make_classification, make_blobs

class DataGenerator:
    @staticmethod
    def generate_linearly_separable(n_samples=100, random_state=42):
        X, y = make_classification(
            n_samples=n_samples,
            n_features=2,
            n_informative=2,
            n_redundant=0,
            n_clusters_per_class=1,
            class_sep=1.0,
            random_state=random_state
        )
        return X, y
    
    @staticmethod
    def generate_blobs(n_samples=100, random_state=42):
        X, y = make_blobs(
            n_samples=n_samples,
            centers=2,
            n_features=2,
            random_state=random_state,
            cluster_std=1.0
        )
        return X, y
    
    @staticmethod
    def generate_xor_data(n_samples=100):
        np.random.seed(42)
        X = np.random.randn(n_samples, 2) * 2
        y = ((X[:, 0] > 0) ^ (X[:, 1] > 0)).astype(int)
        return X, y
