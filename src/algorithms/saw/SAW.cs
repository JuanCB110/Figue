using System;
using System.Text.Json;

namespace DecisionSupport
{
    public class SAW
    {
        private double[,] decisionMatrix;
        private double[] weights;
        private bool[] isBenefit;
        
        public SAW(double[,] matrix, double[] weights, bool[] isBenefit)
        {
            this.decisionMatrix = matrix;
            this.weights = weights;
            this.isBenefit = isBenefit;
        }

        public double[] Calculate()
        {
            // ... [mismo código de cálculo que antes]
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                // Leer JSON de entrada
                string jsonInput = Console.ReadLine();
                var input = JsonSerializer.Deserialize<JsonElement>(jsonInput);
                
                // Procesar datos
                var saw = new SAW(
                    JsonToMatrix(input.GetProperty("matrix")),
                    JsonToArray(input.GetProperty("weights")),
                    JsonToBoolArray(input.GetProperty("isBenefit"))
                );
                
                double[] results = saw.Calculate();
                
                // Enviar resultados como JSON
                Console.WriteLine(JsonSerializer.Serialize(new { results }));
            }
            catch (Exception e)
            {
                Console.Error.WriteLine(JsonSerializer.Serialize(new { error = e.Message }));
                Environment.Exit(1);
            }
        }
        
        // Métodos auxiliares para convertir JSON a arrays
        private static double[,] JsonToMatrix(JsonElement json) { /* ... */ }
        private static double[] JsonToArray(JsonElement json) { /* ... */ }
        private static bool[] JsonToBoolArray(JsonElement json) { /* ... */ }
    }
} 