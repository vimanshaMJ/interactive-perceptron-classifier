let currentData = { X: [], y: [] };
let trainedModel = null;
let trainingChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializePlot();
    setupEventListeners();
    generateData('linear'); // Generate default data
});

function setupEventListeners() {
    // Learning rate slider
    const lrSlider = document.getElementById('learning-rate');
    const lrValue = document.getElementById('lr-value');
    
    lrSlider.addEventListener('input', function() {
        lrValue.textContent = parseFloat(this.value).toFixed(3);
    });
    
    // Plot click handler for adding custom points
    document.getElementById('data-plot').addEventListener('click', function(event) {
        const plotDiv = event.target.closest('#data-plot');
        if (plotDiv && event.target.classList.contains('plotly')) {
            // This will be handled by Plotly's click event
        }
    });
}

function initializePlot() {
    const layout = {
        title: 'Perceptron Data Visualization',
        xaxis: { title: 'Feature 1' },
        yaxis: { title: 'Feature 2' },
        showlegend: true,
        hovermode: 'closest',
        plot_bgcolor: '#f8f9fa',
        paper_bgcolor: 'white'
    };
    
    Plotly.newPlot('data-plot', [], layout, {responsive: true});
    
    // Add click event for custom point addition
    document.getElementById('data-plot').on('plotly_click', function(data) {
        if (data.points.length > 0) {
            const x1 = data.points[0].x;
            const x2 = data.points[0].y;
            const selectedClass = document.querySelector('input[name="class"]:checked').value;
            
            addCustomPoint(x1, x2, parseInt(selectedClass));
        }
    });
}

async function generateData(type) {
    const samples = parseInt(document.getElementById('samples').value);
    
    try {
        const response = await fetch('/generate_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: type,
                samples: samples
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentData = result.data;
            updatePlot();
            updateStats(result.stats);
            resetModel();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to generate data: ' + error.message);
    }
}

async function addCustomPoint(x1, x2, label) {
    try {
        const response = await fetch('/add_point', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                x1: x1,
                x2: x2,
                label: label
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentData = result.data;
            updatePlot();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to add point: ' + error.message);
    }
}

async function clearData() {
    try {
        const response = await fetch('/clear_data', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentData = { X: [], y: [] };
            updatePlot();
            resetModel();
        }
    } catch (error) {
        showError('Failed to clear data: ' + error.message);
    }
}

async function trainModel() {
    if (currentData.X.length === 0) {
        showError('No data available for training');
        return;
    }
    
    const learningRate = parseFloat(document.getElementById('learning-rate').value);
    const epochs = parseInt(document.getElementById('epochs').value);
    
    const trainBtn = document.getElementById('train-btn');
    trainBtn.disabled = true;
    trainBtn.textContent = 'Training...';
    
    updateTrainingStatus('Training in progress...');
    
    try {
        const response = await fetch('/train_model', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                learning_rate: learningRate,
                epochs: epochs
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            trainedModel = result;
            updatePlot();
            updateModelStats(result);
            updateTrainingChart(result.training_history);
            updateTrainingStatus(`Training completed! Final accuracy: ${(result.final_accuracy * 100).toFixed(1)}%`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Training failed: ' + error.message);
    } finally {
        trainBtn.disabled = false;
        trainBtn.textContent = 'Train Perceptron';
    }
}

function resetModel() {
    trainedModel = null;
    updatePlot();
    updateModelStats(null);
    updateTrainingStatus('Ready to train');
    
    if (trainingChart) {
        trainingChart.destroy();
        trainingChart = null;
    }
}

function updatePlot() {
    if (currentData.X.length === 0) {
        Plotly.purge('data-plot');
        initializePlot();
        return;
    }
    
    const X = currentData.X;
    const y = currentData.y;
    
    // Separate classes
    const class0X = [], class0Y = [], class1X = [], class1Y = [];
    
    for (let i = 0; i < X.length; i++) {
        if (y[i] === 0) {
            class0X.push(X[i][0]);
            class0Y.push(X[i][1]);
        } else {
            class1X.push(X[i][0]);
            class1Y.push(X[i][1]);
        }
    }
    
    const traces = [
        {
            x: class0X,
            y: class0Y,
            mode: 'markers',
            type: 'scatter',
            name: 'Class 0',
            marker: {
                color: 'red',
                size: 8,
                symbol: 'circle'
            }
        },
        {
            x: class1X,
            y: class1Y,
            mode: 'markers',
            type: 'scatter',
            name: 'Class 1',
            marker: {
                color: 'blue',
                size: 8,
                symbol: 'triangle-up'
            }
        }
    ];
    
    // Add decision boundary if model is trained
    if (trainedModel && trainedModel.decision_boundary) {
        const boundary = trainedModel.decision_boundary;
        traces.push({
            x: boundary.x1,
            y: boundary.x2,
            mode: 'lines',
            type: 'scatter',
            name: 'Decision Boundary',
            line: {
                color: 'black',
                width: 3
            }
        });
    }
    
    const layout = {
        title: 'Perceptron Data Visualization',
        xaxis: { title: 'Feature 1' },
        yaxis: { title: 'Feature 2' },
        showlegend: true,
        hovermode: 'closest',
        plot_bgcolor: '#f8f9fa',
        paper_bgcolor: 'white'
    };
    
    Plotly.newPlot('data-plot', traces, layout, {responsive: true});
}

function updateStats(stats) {
    if (!stats) return;
    
    const statsContainer = document.getElementById('model-stats');
    statsContainer.innerHTML = `
        <p><strong>Total Samples:</strong> ${stats.total_samples}</p>
        <p><strong>Class 0:</strong> ${stats.class_0_count}</p>
        <p><strong>Class 1:</strong> ${stats.class_1_count}</p>
        <p><strong>Feature 1 Range:</strong> [${stats.feature_ranges.x1[0].toFixed(2)}, ${stats.feature_ranges.x1[1].toFixed(2)}]</p>
        <p><strong>Feature 2 Range:</strong> [${stats.feature_ranges.x2[0].toFixed(2)}, ${stats.feature_ranges.x2[1].toFixed(2)}]</p>
    `;
}

function updateModelStats(result) {
    const statsContainer = document.getElementById('model-stats');
    
    if (!result) {
        statsContainer.innerHTML = '<p>No model trained yet</p>';
        return;
    }
    
    const params = result.model_params;
    statsContainer.innerHTML = `
        <p><strong>Final Accuracy:</strong> ${(result.final_accuracy * 100).toFixed(1)}%</p>
        <p><strong>Weights:</strong> [${params.weights[0].toFixed(3)}, ${params.weights[1].toFixed(3)}]</p>
        <p><strong>Bias:</strong> ${params.bias.toFixed(3)}</p>
        <p><strong>Learning Rate:</strong> ${params.learning_rate}</p>
        <p><strong>Training Epochs:</strong> ${result.training_history.epochs.length}</p>
    `;
}

function updateTrainingChart(history) {
    const ctx = document.getElementById('training-chart').getContext('2d');
    
    if (trainingChart) {
        trainingChart.destroy();
    }
    
    trainingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.epochs,
            datasets: [
                {
                    label: 'Training Error',
                    data: history.errors,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y'
                },
                {
                    label: 'Accuracy',
                    data: history.accuracy,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Training Progress'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Error'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Accuracy'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

async function testPrediction() {
    if (!trainedModel) {
        showError('No trained model available');
        return;
    }
    
    const x1 = parseFloat(document.getElementById('test-x1').value);
    const x2 = parseFloat(document.getElementById('test-x2').value);
    
    if (isNaN(x1) || isNaN(x2)) {
        showError('Please enter valid numbers');
        return;
    }
    
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                x1: x1,
                x2: x2
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const resultDiv = document.getElementById('prediction-result');
            resultDiv.className = 'result success';
            resultDiv.textContent = `Prediction: Class ${result.prediction}`;
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Prediction failed: ' + error.message);
    }
}

async function exportData() {
    try {
        const response = await fetch('/export_data');
        const result = await response.json();
        
        if (result.success) {
            const dataStr = JSON.stringify(result.data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'perceptron_data.json';
            link.click();
            
            URL.revokeObjectURL(url);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Export failed: ' + error.message);
    }
}

function exportModel() {
    if (!trainedModel) {
        showError('No trained model to export');
        return;
    }
    
    const modelData = {
        model_params: trainedModel.model_params,
        training_history: trainedModel.training_history,
        final_accuracy: trainedModel.final_accuracy
    };
    
    const dataStr = JSON.stringify(modelData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'perceptron_model.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function updateTrainingStatus(message) {
    document.getElementById('training-status').textContent = message;
}

function showError(message) {
    const resultDiv = document.getElementById('prediction-result');
    resultDiv.className = 'result error';
    resultDiv.textContent = 'Error: ' + message;
    
    // Also show in console
    console.error(message);
}
