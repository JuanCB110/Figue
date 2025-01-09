#include <iostream>
#include <vector>
#include <cmath>
#include <limits>
#include <iomanip>
#include <fstream>
#include <cstdlib>  // Para getenv
#include <string>   // Para std::string
#ifdef _WIN32
#include <direct.h>
#else
#include <sys/stat.h>
#endif

// Constante para la precisión decimal
const int DECIMAL_PLACES = 4;

class Simplex {
private:
    std::vector<std::vector<double>> tableau;
    int rows, cols;
    bool isMaximization;
    std::ofstream outFile;

    bool isOptimal() {
        for(int j = 0; j < cols - 1; j++) {
            if(tableau[0][j] < 0) return false;
        }
        return true;
    }

    int findPivotColumn() {
        int pivotCol = 0;
        double minValue = tableau[0][0];
        
        for(int j = 1; j < cols - 1; j++) {
            if(tableau[0][j] < minValue) {
                minValue = tableau[0][j];
                pivotCol = j;
            }
        }
        return pivotCol;
    }

    int findPivotRow(int pivotCol) {
        int pivotRow = -1;
        double minRatio = std::numeric_limits<double>::max();
        
        for(int i = 1; i < rows; i++) {
            if(tableau[i][pivotCol] > 0) {
                double ratio = tableau[i][cols-1] / tableau[i][pivotCol];
                if(ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }
        return pivotRow;
    }

    void pivot(int pivotRow, int pivotCol) {
        double pivotValue = tableau[pivotRow][pivotCol];
        
        // Normalizar fila del pivot
        for(int j = 0; j < cols; j++) {
            tableau[pivotRow][j] /= pivotValue;
        }
        
        // Actualizar otras filas
        for(int i = 0; i < rows; i++) {
            if(i != pivotRow) {
                double factor = tableau[i][pivotCol];
                for(int j = 0; j < cols; j++) {
                    tableau[i][j] -= factor * tableau[pivotRow][j];
                }
            }
        }
    }

    std::vector<double> extractSolution() {
        int numVars = cols - rows;
        std::vector<double> solution(numVars, 0.0);
        
        for(int j = 0; j < numVars; j++) {
            int count = 0;
            int row = -1;
            for(int i = 0; i < rows; i++) {
                if(std::abs(tableau[i][j]) < 1e-10) continue;
                if(std::abs(tableau[i][j] - 1.0) < 1e-10) {
                    count++;
                    row = i;
                }
            }
            if(count == 1) {
                solution[j] = tableau[row][cols-1];
            }
        }
        return solution;
    }

    void printTableau(const std::string& mensaje) {
        // Imprimir a consola también para debug
        std::cout << "\n" << mensaje << "\n";
        
        auto printHeader = [&](std::ostream& out) {
            out << "\n" << mensaje << "\n";
            out << "----------------------------------------------------------------\n";
            out << "VB\t";
            for(int j = 0; j < cols - 1; j++) {
                out << "x" << (j+1) << "\t\t";
            }
            out << "bi\n";
            out << "----------------------------------------------------------------\n";
        };

        auto printContent = [&](std::ostream& out) {
            for(int i = 0; i < rows; i++) {
                if(i == 0) out << "Z";
                else out << "s" << i;
                out << "\t";
                
                for(int j = 0; j < cols; j++) {
                    out << std::fixed << std::setprecision(DECIMAL_PLACES) << tableau[i][j] << "\t";
                }
                out << "\n";
            }
            out << "----------------------------------------------------------------\n";
        };

        // Imprimir tanto a consola como a archivo
        printHeader(std::cout);
        printContent(std::cout);
        printHeader(outFile);
        printContent(outFile);
        outFile.flush();
    }

    void printStep(const std::string& mensaje) {
        // Imprimir tanto a consola como a archivo
        std::cout << mensaje << std::endl;
        outFile << mensaje << std::endl;
        outFile.flush();
    }

public:
    Simplex(std::vector<std::vector<double>> matrix, bool isMax = true) {
        tableau = matrix;
        rows = matrix.size();
        cols = matrix[0].size();
        isMaximization = isMax;
        
        // Obtener la ruta temporal del sistema
        std::string outputPath;
        char* tempDir = nullptr;

        #ifdef _WIN32
            tempDir = getenv("TEMP");
            if (!tempDir) tempDir = getenv("TMP");
            if (tempDir) {
                outputPath = std::string(tempDir) + "\\resultado_simplex.txt";
            }
        #else
            tempDir = getenv("TMPDIR");
            if (!tempDir) tempDir = "/tmp";
            outputPath = std::string(tempDir) + "/resultado_simplex.txt";
        #endif

        if (outputPath.empty()) {
            outputPath = "resultado_simplex.txt";  // Fallback
        }

        std::cout << "Intentando crear archivo en: " << outputPath << std::endl;
        
        outFile.open(outputPath, std::ios::out | std::ios::trunc);
        
        if (!outFile.is_open()) {
            std::cerr << "Error al abrir archivo en: " << outputPath << std::endl;
            throw std::runtime_error("No se pudo crear el archivo de resultados");
        }
        
        std::cout << "Archivo creado exitosamente en: " << outputPath << std::endl;
    }

    ~Simplex() {
        if(outFile.is_open()) {
            outFile.flush();  // Asegurar que todo se escriba
            outFile.close();
            std::cout << "Archivo de resultados cerrado correctamente" << std::endl;
        }
    }

    std::vector<double> solve() {
        printStep("\nPROCESO DE SOLUCIÓN DEL MÉTODO SIMPLEX");
        printStep("=====================================");
        
        // Imprimir problema original
        printStep("\nPROBLEMA ORIGINAL:");
        printStep("Función Objetivo:");
        std::string objFunc = "Z = ";
        for(int j = 0; j < cols - rows; j++) {
            if(j > 0) objFunc += " + ";
            objFunc += std::to_string(-tableau[0][j]) + "x" + std::to_string(j+1);
        }
        printStep(objFunc);
        
        printStep("\nRestricciones:");
        for(int i = 1; i < rows; i++) {
            std::string constraint;
            for(int j = 0; j < cols - rows; j++) {
                if(j > 0) constraint += " + ";
                constraint += std::to_string(tableau[i][j]) + "x" + std::to_string(j+1);
            }
            constraint += " ≤ " + std::to_string(tableau[i][cols-1]);
            printStep(constraint);
        }

        printStep("\nINICIO DEL PROCESO DE SOLUCIÓN");
        printTableau("Tableau Inicial");
        
        int iteracion = 1;
        while(!isOptimal()) {
            printStep("\n--------------------");
            printStep("ITERACIÓN " + std::to_string(iteracion++));
            printStep("--------------------");
            
            int pivotCol = findPivotColumn();
            printStep("Variable de entrada: x" + std::to_string(pivotCol + 1));
            
            int pivotRow = findPivotRow(pivotCol);
            if(pivotRow == -1) {
                throw std::runtime_error("El problema no tiene solución acotada");
            }
            printStep("Fila pivote: " + std::to_string(pivotRow));
            
            double pivotElement = tableau[pivotRow][pivotCol];
            printStep("Elemento pivote: " + std::to_string(pivotElement));
            
            pivot(pivotRow, pivotCol);
            printTableau("Tableau después de la iteración " + std::to_string(iteracion-1));
        }
        
        auto solution = extractSolution();
        
        printStep("\nSOLUCIÓN ÓPTIMA ENCONTRADA");
        printStep("=========================");
        for(int i = 0; i < solution.size(); i++) {
            printStep("x" + std::to_string(i+1) + " = " + 
                     std::to_string(solution[i]));
        }
        printStep("Valor óptimo de Z = " + std::to_string(tableau[0][cols-1]));
        
        return solution;
    }
};

int main() {
    int numVars, numRestr;
    std::cin >> numVars >> numRestr;
    
    std::vector<std::vector<double>> matrix(numRestr + 1, std::vector<double>(numVars + numRestr + 1));
    
    for(int i = 0; i < numVars; i++) {
        std::cin >> matrix[0][i];
        matrix[0][i] = -matrix[0][i];
    }
    
    for(int i = 0; i < numRestr; i++) {
        for(int j = 0; j < numVars; j++) {
            std::cin >> matrix[i + 1][j];
        }
        matrix[i + 1][numVars + i] = 1;
        std::cin >> matrix[i + 1][numVars + numRestr];
    }
    
    try {
        Simplex simplex(matrix);
        auto solution = simplex.solve();
        
        // Mantener el objeto simplex vivo hasta que termine todo
        std::cout << "\nProceso completado. Revise el archivo resultado_simplex.txt" << std::endl;
        
    } catch(const std::exception& e) {
        std::cerr << "\nERROR: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}