import com.google.gson.Gson;
import java.util.Random;

public class Perceptron {
    private double[] weights;
    private double bias;
    private double learningRate;
    
    public Perceptron(int inputs, double learningRate) {
        this.weights = new double[inputs];
        this.learningRate = learningRate;
        initializeWeights();
    }
    
    public double train(double[][] trainingData, int[] expectedOutputs, int epochs) {
        double error = 0;
        StringBuilder output = new StringBuilder();
        output.append("ENTRENAMIENTO DEL PERCEPTRON\n");
        output.append("==========================\n\n");
        
        output.append("Datos de entrenamiento:\n");
        for (int i = 0; i < trainingData.length; i++) {
            output.append("Ejemplo ").append(i + 1).append(": [");
            for (int j = 0; j < trainingData[i].length; j++) {
                output.append(String.format("%.2f", trainingData[i][j]));
                if (j < trainingData[i].length - 1) output.append(", ");
            }
            output.append("] -> ").append(expectedOutputs[i]).append("\n");
        }
        
        output.append("\nIniciando entrenamiento...\n");
        for (int epoch = 0; epoch < epochs; epoch++) {
            error = 0;
            for (int i = 0; i < trainingData.length; i++) {
                double prediction = predict(trainingData[i]);
                double localError = expectedOutputs[i] - prediction;
                error += Math.abs(localError);
                
                // Actualizar pesos
                for (int j = 0; j < weights.length; j++) {
                    weights[j] += learningRate * localError * trainingData[i][j];
                }
                bias += learningRate * localError;
            }
            
            if ((epoch + 1) % 100 == 0) {
                output.append(String.format("Época %d: Error = %.4f\n", epoch + 1, error));
            }
        }
        
        output.append("\nEntrenamiento completado\n");
        output.append("Pesos finales: [");
        for (int i = 0; i < weights.length; i++) {
            output.append(String.format("%.4f", weights[i]));
            if (i < weights.length - 1) output.append(", ");
        }
        output.append("]\n");
        output.append(String.format("Bias final: %.4f\n", bias));
        
        System.out.println(output.toString());
        return error;
    }
    
    private double predict(double[] inputs) {
        double sum = bias;
        for (int i = 0; i < weights.length; i++) {
            sum += weights[i] * inputs[i];
        }
        return sum > 0 ? 1 : 0;
    }
    
    private void initializeWeights() {
        Random random = new Random();
        for (int i = 0; i < weights.length; i++) {
            weights[i] = random.nextDouble() * 2 - 1;  // valores entre -1 y 1
        }
        bias = random.nextDouble() * 2 - 1;
    }
    
    public static void main(String[] args) {
        Gson gson = new Gson();
        try {
            // Imprimir el input recibido
            System.err.println("Leyendo entrada...");
            String jsonInput = new java.util.Scanner(System.in).useDelimiter("\\Z").next();
            System.err.println("JSON recibido: " + jsonInput);
            
            InputData input = gson.fromJson(jsonInput, InputData.class);
            
            // Verificar los datos
            System.err.println("Datos de entrenamiento: " + input.trainingData.length + " ejemplos");
            System.err.println("Salidas esperadas: " + input.expectedOutputs.length + " valores");
            System.err.println("Épocas: " + input.epochs);
            
            Perceptron perceptron = new Perceptron(input.trainingData[0].length, 0.1);
            double error = perceptron.train(input.trainingData, input.expectedOutputs, input.epochs);
            
            Result result = new Result(error, perceptron.weights, perceptron.bias);
            System.out.println(gson.toJson(result));
        } catch (Exception e) {
            System.err.println("Error en el Perceptron: " + e.getMessage());
            e.printStackTrace(System.err);
            System.err.println(gson.toJson(new ErrorResult(e.getMessage())));
            System.exit(1);
        }
    }
    
    // Clases auxiliares para JSON
    private static class InputData {
        double[][] trainingData;
        int[] expectedOutputs;
        int epochs;
    }
    
    private static class Result {
        double error;
        double[] weights;
        double bias;
        
        Result(double error, double[] weights, double bias) {
            this.error = error;
            this.weights = weights;
            this.bias = bias;
        }
    }
    
    private static class ErrorResult {
        String error;
        
        ErrorResult(String message) {
            this.error = message;
        }
    }
} 