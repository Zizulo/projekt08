const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Funkcja do wczytania pliku CSV i zwrócenia jego zawartości jako tablicy obiektów
function loadCSV(file) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', data => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', error => {
        reject(error);
      });
  });
}

// Funkcja do porównania dwóch plików CSV i usunięcia powtarzających się rekordów
async function removeDuplicates(file1, file2) {
  try {
    const data1 = await loadCSV(file1);
    const data2 = await loadCSV(file2);

    // Utworzenie zbioru unikalnych kluczy z pierwszego pliku
    console.log(data1);
    const columnAData1 = new Set(data1.map(obj => obj['email'])); // Zmień 'email' na odpowiednią nazwę kolumny
    console.log(columnAData1);
    // Filtracja rekordów w drugim pliku na podstawie kolumny custom:url
    console.log(data2);
    const filteredData2 = data2.filter(obj => !columnAData1.has(obj['Email'])); // Zmień 'Email' na odpowiednią nazwę kolumny
    console.log(filteredData2);

    if (filteredData2.length === 0) {
      console.log('Brak rekordów do zapisania. Plik nie zostanie zmodyfikowany.');
      return;
    }

    // Konfiguracja zapisu do pierwotnego pliku CSV
    const csvWriter = createCsvWriter({
      path: file2,
      header: Object.keys(filteredData2[0]).map(key => ({ id: key, title: key }))
    });

    // Zapisanie zmodyfikowanych danych do pierwotnego pliku CSV
    await csvWriter.writeRecords(filteredData2);

    console.log('Usunięto powtarzające się rekordy i zaktualizowano plik:', file2);
  } catch (error) {
    console.error('Wystąpił błąd:', error);
  }
}

// Wywołanie funkcji z odpowiednimi ścieżkami do plików CSV
removeDuplicates('file1.csv', 'file2.csv');
