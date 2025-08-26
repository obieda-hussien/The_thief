/**
 * Simple Neural Network implementation for AI agents
 */
class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        
        // Initialize weights randomly
        this.weightsInputHidden = this.createMatrix(inputSize, hiddenSize);
        this.weightsHiddenOutput = this.createMatrix(hiddenSize, outputSize);
        
        // Initialize biases
        this.biasHidden = new Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
        this.biasOutput = new Array(outputSize).fill(0).map(() => Math.random() * 2 - 1);
        
        this.randomizeWeights();
    }
    
    createMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = new Array(cols);
        }
        return matrix;
    }
    
    randomizeWeights() {
        // Xavier initialization
        const limitInputHidden = Math.sqrt(6 / (this.inputSize + this.hiddenSize));
        const limitHiddenOutput = Math.sqrt(6 / (this.hiddenSize + this.outputSize));
        
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weightsInputHidden[i][j] = (Math.random() * 2 - 1) * limitInputHidden;
            }
        }
        
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                this.weightsHiddenOutput[i][j] = (Math.random() * 2 - 1) * limitHiddenOutput;
            }
        }
    }
    
    predict(inputs) {
        if (inputs.length !== this.inputSize) {
            throw new Error(`Expected ${this.inputSize} inputs, got ${inputs.length}`);
        }
        
        // Forward pass through hidden layer
        const hiddenOutputs = new Array(this.hiddenSize);
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.biasHidden[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += inputs[j] * this.weightsInputHidden[j][i];
            }
            hiddenOutputs[i] = this.tanh(sum);
        }
        
        // Forward pass through output layer
        const outputs = new Array(this.outputSize);
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.biasOutput[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hiddenOutputs[j] * this.weightsHiddenOutput[j][i];
            }
            outputs[i] = this.tanh(sum);
        }
        
        return outputs;
    }
    
    tanh(x) {
        return Math.tanh(x);
    }
    
    copy() {
        const newNN = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        
        // Copy weights
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                newNN.weightsInputHidden[i][j] = this.weightsInputHidden[i][j];
            }
        }
        
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                newNN.weightsHiddenOutput[i][j] = this.weightsHiddenOutput[i][j];
            }
        }
        
        // Copy biases
        for (let i = 0; i < this.hiddenSize; i++) {
            newNN.biasHidden[i] = this.biasHidden[i];
        }
        
        for (let i = 0; i < this.outputSize; i++) {
            newNN.biasOutput[i] = this.biasOutput[i];
        }
        
        return newNN;
    }
    
    mutate(mutationRate, mutationStrength) {
        // Mutate input-hidden weights
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                if (Math.random() < mutationRate) {
                    this.weightsInputHidden[i][j] += (Math.random() * 2 - 1) * mutationStrength;
                }
            }
        }
        
        // Mutate hidden-output weights
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                if (Math.random() < mutationRate) {
                    this.weightsHiddenOutput[i][j] += (Math.random() * 2 - 1) * mutationStrength;
                }
            }
        }
        
        // Mutate biases
        for (let i = 0; i < this.hiddenSize; i++) {
            if (Math.random() < mutationRate) {
                this.biasHidden[i] += (Math.random() * 2 - 1) * mutationStrength;
            }
        }
        
        for (let i = 0; i < this.outputSize; i++) {
            if (Math.random() < mutationRate) {
                this.biasOutput[i] += (Math.random() * 2 - 1) * mutationStrength;
            }
        }
    }
    
    crossover(other) {
        const child = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        
        // Crossover input-hidden weights
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                child.weightsInputHidden[i][j] = Math.random() < 0.5 
                    ? this.weightsInputHidden[i][j] 
                    : other.weightsInputHidden[i][j];
            }
        }
        
        // Crossover hidden-output weights
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                child.weightsHiddenOutput[i][j] = Math.random() < 0.5 
                    ? this.weightsHiddenOutput[i][j] 
                    : other.weightsHiddenOutput[i][j];
            }
        }
        
        // Crossover biases
        for (let i = 0; i < this.hiddenSize; i++) {
            child.biasHidden[i] = Math.random() < 0.5 
                ? this.biasHidden[i] 
                : other.biasHidden[i];
        }
        
        for (let i = 0; i < this.outputSize; i++) {
            child.biasOutput[i] = Math.random() < 0.5 
                ? this.biasOutput[i] 
                : other.biasOutput[i];
        }
        
        return child;
    }
}