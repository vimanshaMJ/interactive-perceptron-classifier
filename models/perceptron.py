import numpy as np

class WebPerceptron:
    def __init__(self, num_features, learning_rate=0.01):
        self.num_features = num_features
        self.learning_rate = learning_rate
        self.weights = np.random.normal(0, 0.1, num_features)
        self.bias = 0.0
        self.is_trained = False
    
    def forward(self, x):
        weighted_sum = self.bias + np.dot(x, self.weights)
        return 1 if weighted_sum > 0 else 0
    
    def predict(self, X):
        if len(X.shape) == 1:
            return self.forward(X)
        return np.array([self.forward(x) for x in X])
    
    def update(self, x, y_true):
        prediction = self.forward(x)
        error = y_true - prediction
        
        self.bias += self.learning_rate * error
        self.weights += self.learning_rate * error * x
        
        return abs(error)
    
    def fit(self, X, y, epochs=100):
        training_history = {
            'epochs': [],
            'errors': [],
            'accuracy': [],
            'weights_history': [],
            'bias_history': []
        }
        
        for epoch in range(epochs):
            total_error = 0
            for i in range(len(X)):
                error = self.update(X[i], y[i])
                total_error += error
            
            # Calculate accuracy
            predictions = self.predict(X)
            accuracy = np.mean(predictions == y)
            
            # Store history
            training_history['epochs'].append(epoch + 1)
            training_history['errors'].append(int(total_error))
            training_history['accuracy'].append(float(accuracy))
            training_history['weights_history'].append(self.weights.tolist())
            training_history['bias_history'].append(float(self.bias))
        
        self.is_trained = True
        return training_history
    
    def get_decision_boundary(self, x_range=(-5, 5)):
        if not self.is_trained or self.weights[1] == 0:
            return None
        
        x1_min, x1_max = x_range
        x2_min = (-(self.weights[0] * x1_min) - self.bias) / self.weights[1]
        x2_max = (-(self.weights[0] * x1_max) - self.bias) / self.weights[1]
        
        return {
            'x1': [x1_min, x1_max],
            'x2': [float(x2_min), float(x2_max)]
        }
