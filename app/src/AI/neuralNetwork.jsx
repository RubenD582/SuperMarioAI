export default class NeuralNetwork {
  constructor(inputLayer, hiddenLayer, outputLayer) {
    this.input = inputLayer;
    this.hidden = hiddenLayer;
    this.output = outputLayer;
    this.fitness = 0;

    // Initialize weights with He initialization
    this.inputHidden = Array.from({ length: this.input }, () =>
      Array.from({ length: this.hidden }, () =>
        (Math.random() * 2 - 1) * Math.sqrt(2 / this.input)
      )
    );
    this.hiddenOutput = Array.from({ length: this.hidden }, () =>
      Array.from({ length: this.output }, () =>
        (Math.random() * 2 - 1) * Math.sqrt(2 / this.hidden)
      )
    );

    this.hiddenBias = Array.from({ length: this.hidden }, () => 0);
    this.outputBias = Array.from({ length: this.output }, () => 0);
  }

  feedforward(inputs) {
    // Calculate hidden layer with ReLU activation
    this.hiddenValues = [];
    for (let i = 0; i < this.hidden; i++) {
      let sum = 0;
      for (let j = 0; j < inputs.length; j++) {
        sum += inputs[j] * this.inputHidden[j][i];
      }
      // ReLU activation for hidden layer
      this.hiddenValues.push(Math.max(0, sum + this.hiddenBias[i]));
    }

    // Calculate the output values with sigmoid activation
    this.outputValues = [];
    for (let i = 0; i < this.output; i++) {
      let sum = 0;
      for (let j = 0; j < this.hidden; j++) {
        sum += this.hiddenValues[j] * this.hiddenOutput[j][i];
      }
      // Sigmoid activation for output layer
      this.outputValues.push(Math.tanh(sum + this.outputBias[i]));
    }

    return this.outputValues;
  }

  sigmoid(x) {
    if (x >= 0) {
      return 1 / (1 + Math.exp(-x));
    } else {
      return Math.exp(x) / (1 + Math.exp(x));
    }
  }

  tanh(x) {
    return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
  }

  mutation(mutationRate = 0.1, mutationStrength = 0.1) {
    const mutate = (value) => {
      if (Math.random() < mutationRate) {
        // Gaussian mutation
        const gaussian = () => {
          let u = 0, v = 0;
          while (u === 0) u = Math.random();
          while (v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        return value + gaussian() * mutationStrength;
      }
      return value;
    };

    // Mutate weights and biases
    this.inputHidden = this.inputHidden.map(row =>
      row.map(weight => mutate(weight))
    );

    this.hiddenOutput = this.hiddenOutput.map(row =>
      row.map(weight => mutate(weight))
    );

    this.hiddenBias = this.hiddenBias.map(bias => mutate(bias));
    this.outputBias = this.outputBias.map(bias => mutate(bias));
  }

  crossover(other) {
    const child = new NeuralNetwork(this.input, this.hidden, this.output);

    // Interpolation crossover
    const interpolate = (a, b) => {
      const ratio = Math.random();
      return a * ratio + b * (1 - ratio);
    };

    // Crossover weights using interpolation
    child.inputHidden = this.inputHidden.map((row, i) =>
      row.map((weight, j) => interpolate(weight, other.inputHidden[i][j]))
    );

    child.hiddenOutput = this.hiddenOutput.map((row, i) =>
      row.map((weight, j) => interpolate(weight, other.hiddenOutput[i][j]))
    );

    // Crossover biases using interpolation
    child.hiddenBias = this.hiddenBias.map((bias, i) =>
      interpolate(bias, other.hiddenBias[i])
    );

    child.outputBias = this.outputBias.map((bias, i) =>
      interpolate(bias, other.outputBias[i])
    );

    return child;
  }

  clone() {
    const clone = new NeuralNetwork(this.input, this.hidden, this.output);
    clone.inputHidden = this.inputHidden.map(row => [...row]);
    clone.hiddenOutput = this.hiddenOutput.map(row => [...row]);
    clone.hiddenBias = [...this.hiddenBias];
    clone.outputBias = [...this.outputBias];
    return clone;
  }
}