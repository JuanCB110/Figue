using System;
using System.Text.Json;
using System.Text;

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
            int rows = decisionMatrix.GetLength(0);
            int cols = decisionMatrix.GetLength(1);
            
            StringBuilder output = new StringBuilder();
            output.AppendLine("PROCESO DE ANÁLISIS SAW (Simple Additive Weighting)");
            output.AppendLine("================================================\n");
            
            // Mostrar matriz original
            output.AppendLine("Matriz de Decisión Original:");
            PrintMatrix(output, decisionMatrix);
            
            // Normalización
            double[,] normalized = new double[rows, cols];
            output.AppendLine("\nProceso de Normalización:");
            
            for (int j = 0; j < cols; j++)
            {
                double max = double.MinValue;
                double min = double.MaxValue;
                
                for (int i = 0; i < rows; i++)
                {
                    max = Math.Max(max, decisionMatrix[i, j]);
                    min = Math.Min(min, decisionMatrix[i, j]);
                }
                
                output.AppendLine($"\nCriterio {j + 1}:");
                output.AppendLine($"Máximo: {max:F4}, Mínimo: {min:F4}");
                output.AppendLine($"Tipo: {(isBenefit[j] ? "Beneficio" : "Costo")}");
                
                for (int i = 0; i < rows; i++)
                {
                    if (isBenefit[j])
                    {
                        normalized[i, j] = decisionMatrix[i, j] / max;
                    }
                    else
                    {
                        normalized[i, j] = min / decisionMatrix[i, j];
                    }
                }
            }
            
            output.AppendLine("\nMatriz Normalizada:");
            PrintMatrix(output, normalized);
            
            // Calcular puntuaciones finales
            output.AppendLine("\nPesos de los Criterios:");
            for (int j = 0; j < cols; j++)
            {
                output.AppendLine($"W{j + 1}: {weights[j]:F4}");
            }
            
            double[] scores = new double[rows];
            for (int i = 0; i < rows; i++)
            {
                double sum = 0;
                for (int j = 0; j < cols; j++)
                {
                    sum += normalized[i, j] * weights[j];
                }
                scores[i] = sum;
            }
            
            output.AppendLine("\nPuntuaciones Finales:");
            for (int i = 0; i < rows; i++)
            {
                output.AppendLine($"Alternativa {i + 1}: {scores[i]:F4}");
            }
            
            // Encontrar la mejor alternativa
            int bestIndex = 0;
            double bestScore = scores[0];
            for (int i = 1; i < rows; i++)
            {
                if (scores[i] > bestScore)
                {
                    bestScore = scores[i];
                    bestIndex = i;
                }
            }
            
            output.AppendLine($"\nMEJOR ALTERNATIVA: Alternativa {bestIndex + 1} con puntuación {bestScore:F4}");
            
            Console.Write(output.ToString());
            return scores;
        }

        private void PrintMatrix(StringBuilder sb, double[,] matrix)
        {
            int rows = matrix.GetLength(0);
            int cols = matrix.GetLength(1);
            
            sb.Append("      ");
            for (int j = 0; j < cols; j++)
            {
                sb.Append($"C{j + 1,-8} ");
            }
            sb.AppendLine();
            
            for (int i = 0; i < rows; i++)
            {
                sb.Append($"A{i + 1,-5} ");
                for (int j = 0; j < cols; j++)
                {
                    sb.Append($"{matrix[i, j],-8:F4} ");
                }
                sb.AppendLine();
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                string jsonInput = Console.ReadLine();
                var input = JsonSerializer.Deserialize<JsonElement>(jsonInput);
                
                var saw = new SAW(
                    JsonToMatrix(input.GetProperty("matrix")),
                    JsonToArray(input.GetProperty("weights")),
                    JsonToBoolArray(input.GetProperty("isBenefit"))
                );
                
                saw.Calculate();
            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"Error: {e.Message}");
                Environment.Exit(1);
            }
        }
        
        private static double[,] JsonToMatrix(JsonElement json)
        {
            var rows = json.GetArrayLength();
            var cols = json[0].GetArrayLength();
            var matrix = new double[rows, cols];
            
            for (int i = 0; i < rows; i++)
            {
                for (int j = 0; j < cols; j++)
                {
                    matrix[i, j] = json[i][j].GetDouble();
                }
            }
            return matrix;
        }
        
        private static double[] JsonToArray(JsonElement json)
        {
            var array = new double[json.GetArrayLength()];
            for (int i = 0; i < array.Length; i++)
            {
                array[i] = json[i].GetDouble();
            }
            return array;
        }
        
        private static bool[] JsonToBoolArray(JsonElement json)
        {
            var array = new bool[json.GetArrayLength()];
            for (int i = 0; i < array.Length; i++)
            {
                array[i] = json[i].GetBoolean();
            }
            return array;
        }
    }
} 