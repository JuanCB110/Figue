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
        // ... [mismo código de entrenamiento que antes]
    }
    
    public static void main(String[] args) {
        try {
            // Leer JSON de entrada
            Gson gson = new Gson();
            InputData input = gson.fromJson(new java.io.InputStreamReader(System.in), InputData.class);
            
            Perceptron perceptron = new Perceptron(input.trainingData[0].length, 0.1);
            double error = perceptron.train(input.trainingData, input.expectedOutputs, input.epochs);
            
            // Enviar resultados como JSON
            Result result = new Result(error, perceptron.weights, perceptron.bias);
            System.out.println(gson.toJson(result));
        } catch (Exception e) {
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