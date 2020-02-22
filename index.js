const fsExtra = require('fs-extra')

let tmpLibData = {};
let libBooksArr = [];

let index = null;
let line = null;

let booksCount = null;
let booksArray = [];
let maxBookWeight = null;
let libsCount = null;
let deadline = null;
let currentSignUpCount = null;
let libraries = [];

let outPut = '';
                                                                      // ####################################################################################################################################################################
                                                                      // TODO:  возможно нужно обрезать массив книг одной библиотеки только после пересчета коеффициента,
                                                                      //        во время этого не трогать библиотеки с обрезанными массивами книг (библиотеки которые точно на оптимальной позиции)
                                                                      // TODO:  сортировать массив библиотек с пересчетом коеффициента,
                                                                      //        тоесть при каждой итерации отнимать от дедлайна количество дней, затраченых предидущими библиотеками для входа (создать специальную переменную для этого),
                                                                      // TODO:  убирать из массива книг каждой библиотеки книги, которые уже существуют в предидущих библиотеках
                                                                      // ####################################################################################################################################################################
function showCalculatedData() {
  // console.log('booksCount:', booksCount);
  // console.log('libsCount:', libsCount);
  // console.log('deadline:', deadline);
  // console.log('booksArray:', booksArray);
  // console.log('maxBookWeight:', maxBookWeight);
  console.log('libraries:', libraries);
  console.log(outPut);
}

function sortLibBooksArrSetCoefficient(arr, count, tmpLibData) {
  arr = arr.sort((a, b) => { // сортируем массив весов книг от большего к меньшему и оставляем столько первых елементов, сколько библиотека может отправить если будет первой
    return b - a;
  }).slice(-startBooksCount(tmpLibData));
  tmpLibData.coefficient = arr.reduce((a,b) => a + b)
}

function startBooksCount(libData) { // количество книг отправленых библиотекой если она будет первой для входа
  return (deadline - libData.signUpProcess) * libData.perDay
}

function clrOutputDirectory() {
  const directory  = 'out';

  fsExtra.emptyDirSync(directory)
}

function saveData(fName) {
  fsExtra.outputFileSync('out/' + fName, outPut)
  // fs.writeFile("out/a_example.txt", libraries, function(err) {
  //   if(err) {
  //     return console.log(err);
  //   }
  //   console.log("The file was saved!");
  // });
}

function readLines(input) {
  let remaining = '';

  libraries = [];
  outPut = '';
  remaining += input;

  index = remaining.indexOf('\n');
  line = remaining.substring(0, index).split(' ');

  booksCount = parseInt(line[0]);
  libsCount = parseInt(line[1]);
  deadline = parseInt(line[2]) - 1;

  remaining = remaining.substring(index + 1);
  index = remaining.indexOf('\n');

  line = remaining.substring(0, index);

  booksArray = [...line.split(' ').map(item => parseInt(item))];
  maxBookWeight = Math.max(...booksArray);

  remaining = remaining.substring(index + 1);
  index = remaining.indexOf('\n');

  let libStarterIndex = 0;

  while (index > -1) {
    tmpLibData = {};
    libBooksArr = [];

    line = remaining.substring(0, index).split(' ');
    remaining = remaining.substring(index + 1);

    tmpLibData = {
      booksCount: parseInt(line[0]),
      signUpProcess: parseInt(line[1]),
      perDay: parseInt(line[2])
    };

    index = remaining.indexOf('\n');

    line = remaining.substring(0, index);
    remaining = remaining.substring(index + 1);

    libBooksArr.push(...line.split(' ').map(item => booksArray[parseInt(item)])); // заполнение массива книг библиотеки весами книг из общего массива
    sortLibBooksArrSetCoefficient(libBooksArr, libBooksArr.length, tmpLibData); // сортировка книг из большего массива по весу от большего к меньшему

    index = remaining.indexOf('\n');

    libraries.push({
      libStarterIndex,
      ...tmpLibData,
      libBooksArr
    })
  }

  libraries = libraries.sort((a, b) => { // сортируем массив весов книг от большего к меньшему и оставляем столько первых елементов, сколько библиотека может отправить если будет первой
    return b.coefficient - a.coefficient;
  });

  outPut += libraries.length + '\n'

  libraries.forEach((lib, index) => {
    outPut += lib.libStarterIndex + ' ' + lib.libBooksArr.length + '\n'
    outPut += lib.libBooksArr.toString().replace(/,/g, ' ') + '\n'
  });

  libStarterIndex++;
}

const fileNames = [
  'a_example.txt',
  // 'b_read_on.txt',
  // 'c_incunabula.txt',
  // 'd_tough_choices.txt',
  // 'e_so_many_books.txt',
  // 'f_libraries_of_the_world.txt'
];


// let input = fs.createReadStream('in/a_example.txt');

clrOutputDirectory();

fileNames.forEach(fName => {
  fsExtra.readFile('in/' + fName, 'utf8', (err, data) => {
    if (err) throw err;
    readLines(data);
    showCalculatedData();
    saveData(fName);
  });
})

// fsExtra.readFile('in/a_example.txt', 'utf8', (err, data) => {
//   if (err) throw err;
//   // console.log(input.indexOf('\n'));
//   readLines(data);
// });
// readLines(input);
// console.log(input)

// input = fs.createReadStream('in/b_read_on.txt');
// readLines(input);
