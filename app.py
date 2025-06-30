from flask import Flask, render_template, request, jsonify
import numpy as np
import json
from models.perceptron import WebPerceptron
from utils.data_generator import DataGenerator
import base64
import io
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

app = Flask(__name__)

# Global variables to store model and data
perceptron_model = None
current_data = {'X': [], 'y': []}
training_history = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_data', methods=['POST'])
def generate_data():
    global current_data
    
    data_type = request.json.get('type', 'linear')
    n_samples = request.json.get('samples', 100)
    
    try:
        if data_type == 'linear':
            X, y = DataGenerator.generate_linearly_separable(n_samples)
        elif data_type == 'blobs':
            X, y = DataGenerator.generate_blobs(n_samples)
        elif data_type == 'xor':
            X, y = DataGenerator.generate_xor_data(n_samples)
        else:
            return jsonify({'error': 'Invalid data type'}), 400
        
        current_data = {'X': X.tolist(), 'y': y.tolist()}
        
        return jsonify({
            'success': True,
            'data': current_data,
            'stats': {
                'total_samples': len(X),
                'class_0_count': int(np.sum(y == 0)),
                'class_1_count': int(np.sum(y == 1)),
                'feature_ranges': {
                    'x1': [float(X[:, 0].min()), float(X[:, 0].max())],
                    'x2': [float(X[:, 1].min()), float(X[:, 1].max())]
                }
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_point', methods=['POST'])
def add_point():
    global current_data
    
    try:
        x1 = float(request.json.get('x1'))
        x2 = float(request.json.get('x2'))
        label = int(request.json.get('label'))
        
        current_data['X'].append([x1, x2])
        current_data['y'].append(label)
        
        return jsonify({'success': True, 'data': current_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/clear_data', methods=['POST'])
def clear_data():
    global current_data, perceptron_model, training_history
    
    current_data = {'X': [], 'y': []}
    perceptron_model = None
    training_history = []
    
    return jsonify({'success': True})

@app.route('/train_model', methods=['POST'])
def train_model():
    global perceptron_model, current_data, training_history
    
    if not current_data['X']:
        return jsonify({'error': 'No data available for training'}), 400
    
    try:
        learning_rate = float(request.json.get('learning_rate', 0.01))
        epochs = int(request.json.get('epochs', 100))
        
        X = np.array(current_data['X'])
        y = np.array(current_data['y'])
        
        perceptron_model = WebPerceptron(num_features=2, learning_rate=learning_rate)
        training_history = perceptron_model.fit(X, y, epochs=epochs)
        
        # Get decision boundary
        boundary = perceptron_model.get_decision_boundary()
        
        # Calculate final accuracy
        predictions = perceptron_model.predict(X)
        accuracy = np.mean(predictions == y)
        
        return jsonify({
            'success': True,
            'model_params': {
                'weights': perceptron_model.weights.tolist(),
                'bias': float(perceptron_model.bias),
                'learning_rate': learning_rate
            },
            'training_history': training_history,
            'decision_boundary': boundary,
            'final_accuracy': float(accuracy)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    global perceptron_model
    
    if perceptron_model is None:
        return jsonify({'error': 'No trained model available'}), 400
    
    try:
        x1 = float(request.json.get('x1'))
        x2 = float(request.json.get('x2'))
        
        prediction = perceptron_model.predict(np.array([[x1, x2]]))
        
        return jsonify({
            'success': True,
            'prediction': int(prediction[0])
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/export_data', methods=['GET'])
def export_data():
    global current_data
    
    if not current_data['X']:
        return jsonify({'error': 'No data to export'}), 400
    
    return jsonify({
        'success': True,
        'data': current_data
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
