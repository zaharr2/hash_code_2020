const fs = require('fs');

let tmpLibData = {};
let tmpLibBooksArr = [];

let index = null;
let line = null;

let booksCount = null;
let booksArray = null;
let libsCount = null;
let deadline = null;
let libraries = [];

function consoleLog(title, data) {
  console.log(title + ':', data)
}
                                                                      // ####################################################################################################################################################################
                                                                      // TODO:  возможно нужно обрезать массив книг одной библиотеки только после пересчета коеффициента,
                                                                      //        во время этого не трогать библиотеки с обрезанными массивами книг (библиотеки которые точно на оптимальной позиции)
                                                                      // TODO:  сортировать массив библиотек с пересчетом коеффициента,
                                                                      //        тоесть при каждой итерации отнимать от дедлайна количество дней, затраченых предидущими библиотеками для входа (создать специальную переменную для этого),
                                                                      // TODO:  убирать из массива книг каждой библиотеки книги, которые уже существуют в предидущих библиотеках
                                                                      // ####################################################################################################################################################################
function showCalculatedData() {
  consoleLog('booksCount', booksCount);
  consoleLog('libsCount', libsCount);
  consoleLog('deadline', deadline);
  consoleLog('booksArray', booksArray);
  consoleLog('libraries', libraries);
}

function sortLibBooksArrSetCoefficient(arr, count, tmpLibData) {
  arr = arr.sort(function(a, b) { // ортируем массив весов книг от большего к меньшему и оставляем столько первых елементов, сколько библиотека может отправить если будет первой
    return b - a;
  }).slice(-startBooksCount(tmpLibData))
  tmpLibData.coefficient = arr.reduce((a,b) => a + b)
}

function startBooksCount(libData) { // количество книг отправленых библиотекой если она будет первой для входа
  return (deadline - libData.signUpProcess) * libData.perDay
}

function readLines(input) {
  let remaining = '';

  input.on('data', (data) => {
    remaining += data;
    index = remaining.indexOf('\n');
    line = remaining.substring(0, index);

    booksCount = parseInt(line[0])
    libsCount = parseInt(line[2])
    deadline = parseInt(line[4])

    remaining = remaining.substring(index + 1);
    index = remaining.indexOf('\n');

    line = remaining.substring(0, index);

    booksArray = [...line.split(' ').map(item => parseInt(item))]

    remaining = remaining.substring(index + 1);
    index = remaining.indexOf('\n');

    while (index > -1) {
      tmpLibData = {}
      tmpLibBooksArr = []

      line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);

      tmpLibData = {
        booksCount: parseInt(line[0]),
        signUpProcess: parseInt(line[2]),
        perDay: parseInt(line[4])
      }

      index = remaining.indexOf('\n');

      line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);

      tmpLibBooksArr.push(...line.split(' ').map(item => booksArray[parseInt(item)])) // заполнение массива книг библиотеки весами книг из общего массива
      sortLibBooksArrSetCoefficient(tmpLibBooksArr, tmpLibBooksArr.length, tmpLibData) // сортировка книг из большего массива по весу от большего к меньшему

      index = remaining.indexOf('\n');

      libraries.push({
        libData: tmpLibData,
        libBooksArr: tmpLibBooksArr
      })
    }
  });

  input.on('end', () => {
    if (remaining.length > 0) {
      console.log(remaining);
    }

    showCalculatedData()
  });
}

let input = fs.createReadStream('in/a_example.txt');
readLines(input);