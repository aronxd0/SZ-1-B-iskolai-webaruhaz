using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Diagnostics;
using System.Xml.Linq;

namespace CSV_Import {
    internal class Program {
        static void Main(string[] args) {

            
            if (args.Length == 0) {
                //Console.WriteLine("Nincs megadva CSV fájl!");
                return;
            }
            

            
            string filePath = args[0];

            if (!File.Exists(filePath))
            {
                //Console.WriteLine("A fájl nem létezik: " + filePath);
                return;
            }
            

            try
            {
                var lines = File.ReadAllLines(filePath, Encoding.UTF8);
                string json = "[";

                for (int i = 0; i < lines.Length; i++) {
                    string lineEscaped = lines[i].Replace("\\", "\\\\").Replace("\"", "\\\"");
                    json += $"\"{lineEscaped}\"";
                    if (i < lines.Length - 1) json += ",";
                }

                json += "]";
                Console.WriteLine(json);
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Hiba a fájl olvasása közben: " + ex.Message);
            }
        }
    }
}
