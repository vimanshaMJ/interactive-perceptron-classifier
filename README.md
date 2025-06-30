# 🧠 Interactive Perceptron Web Simulator

A modern, interactive web application for visualizing and experimenting with the perceptron learning algorithm. Built with Flask, this tool provides real-time visualization of the learning process and allows users to experiment with different datasets and parameters.

## ✨ Features

- **Real-time Visualization**: Watch the decision boundary evolve during training
- **Interactive Data Generation**: Create linearly separable, blob, or XOR datasets
- **Custom Point Addition**: Click on the plot to add your own data points
- **Parameter Tuning**: Adjust learning rate and epochs with interactive controls
- **Training History**: Visualize error and accuracy curves
- **Prediction Testing**: Test the trained model with custom inputs
- **Export Functionality**: Download data and model parameters
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

1. **Clone the repository**: <br/>
git clone `git@github.com:vimanshaMJ/perceptron_web_app.git` <br/>
cd perceptron_web_app


2. **Create virtual environment**:<br/>
python -m venv venv <br/>
venv\Scripts\activate


3. **Install dependencies**: <br/>
pip install -r requirements.txt


4. **Run the application**: <br/>
python app.py


5. **Open your browser** and navigate to `http://localhost:5000`

## 🎯 How to Use

1. **Generate Data**: Choose from predefined datasets or create custom points
2. **Set Parameters**: Adjust learning rate and number of epochs
3. **Train Model**: Click "Train Perceptron" to start the learning process
4. **Visualize Results**: Watch the decision boundary and training progress
5. **Test Predictions**: Input custom values to test the trained model
6. **Export Results**: Download your data and model for later use

## 🛠️ Technical Tools

- **Machine Learning**: Custom perceptron implementation with NumPy
- **Backend**: Flask with RESTful API endpoints
- **Frontend**: Vanilla JavaScript with Plotly.js and Chart.js
- **Visualization**: Interactive plots with real-time updates
- **Responsive Design**: CSS Grid and Flexbox for modern layouts

## 📁 Project Structure

```
perceptron_web_app/
├── app.py
├── requirements.txt
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── data.js
│   │   ├── plotly.js
│   │   └── utils.js
│   └── index.html
└── templates/
    └── index.html
```

## 📄 License

MIT License
