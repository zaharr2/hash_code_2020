const fsExtra = require('fs-extra');

let index = null;
let line = null;

let booksCount = null;
let booksArray = [];
let maxBookWeight = null;
let libsCount = null;
let deadline = null;
let currentSignUpCount = null;
let libraries = [];

let tmpLibData = {};
let libBooksArr = [];
let libStarterIndex = 0;

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
  // console.log('libraries:', libraries);
  // console.log(outPut);
}

function sortLibBooksArr() {
  libBooksArr = libBooksArr.sort((a, b) => { // сортируем массив весов книг от большего к меньшему и оставляем столько первых елементов, сколько библиотека может отправить если будет первой
    return b - a;
  })
  // }).slice(-startBooksCount(tmpLibData));
}

let tmpUniq = [];
let tmpArr = [];

function setCoefficient() {
  tmpUniq = Array.of(...new Set(libBooksArr));
  tmpArr = [...libBooksArr];

  tmpUniq.forEach(el => {
    for (let i = 0; i < tmpArr.length; i++) {
      if (tmpArr[i] === el) {
        tmpArr.splice(i, 1)[0];
        break;
      }
    }
  });

  libBooksArr = [...tmpUniq, ...tmpArr]

  // console.log('arr', libBooksArr);

  // console.log('UNIQ VAL IN ARR OF BOOKS WEIGHTS:', tmpUniq);
  tmpLibData.coefficient = tmpUniq.reduce((accumulator, currentValue) => {
    return accumulator + currentValue / maxBookWeight
  }, 0);
  // console.log('coefficient', tmpLibData.coefficient)
}

function startBooksCount(tmpLibData) { // количество книг отправленых библиотекой если она будет первой для входа
  return (deadline - tmpLibData.signUpProcess) * tmpLibData.perDay
}

function moveLibWithMaxCoefficientToFirst(maxCoefficientVal) {
  for (let i = 0; i < libraries.length; i++) {
    if (libraries[i].coefficient === maxCoefficientVal) {
      let tmp = libraries[i];
      libraries.splice(i, 1);
      libraries.unshift(tmp);
      break;
    }
  }
}

function sortLibrariesByCoefficient() {
                                                  // TODO цикл сортировки библиотек
                                                  // TODO начинаем с индекса 1
                                                  // TODO после каждой прогонки массива прибавляем к счетчику 1
                                                  // TODO
  let leftLibArrayPart = [];
  let rightLibArrayPart = [];
  let sumOfSignUps = 0;
  let splitCount = 1;
  let uniqLeftPartArrValues = [];

  let maxCoefficientVal = Math.max(...libraries.map(val => val.coefficient));

  // console.log('libraries before', libraries);

  moveLibWithMaxCoefficientToFirst(maxCoefficientVal);

  // console.log('libraries after', libraries);

  let tmpLibBooksArr = [];
  let uniqTmpLibBooksArr = []; // уникальные значения в массиве книг одной библиотеки

  // console.log('libraries', libraries.map(el => el.libBooksArr));

  while (sumOfSignUps < deadline || splitCount <= libsCount) {
    sumOfSignUps = 0;

    leftLibArrayPart = libraries.slice(0, splitCount); // левая часть библиотеки

    // console.log('leftLibArrayPart', leftLibArrayPart);

    sumOfSignUps = leftLibArrayPart.reduce((accumulator, currentValue) => { // сумма signUpProcess левой части массива библиотек
      if (!currentValue) return;
      return accumulator + currentValue.signUpProcess;
    }, 0);

    uniqLeftPartArrValues.push(Array.of(...new Set(leftLibArrayPart[leftLibArrayPart.length - 1].libBooksArr))); // поиск уникальных значений в последней библиотеке левой части массива

    rightLibArrayPart = libraries.slice(splitCount); // правая часть библиотеки

    // console.log('leftLibArrayPart', leftLibArrayPart);
    // console.log('rightLibArrayPart', rightLibArrayPart);

    // uniqLeftPartArrValues.forEach(el => {
    //   for (let i = 0; i < rightLibArrayPart.length; i++) {
    //     if (rightLibArrayPart[i] === el) {
    //       tmpArr.splice(i, 1)[0];
    //       break;
    //     }
    //   }
    // });

    rightLibArrayPart.forEach(lib => {
      // console.log('BEFORE', lib.libBooksArr);

      tmpLibBooksArr = [...lib.libBooksArr];
      uniqTmpLibBooksArr = [];

      uniqLeftPartArrValues.forEach(val => {
        for (let i = 0; i < tmpLibBooksArr.length; i++) {
          if (val === tmpLibBooksArr[i]) {
            uniqTmpLibBooksArr.push(tmpLibBooksArr.splice(i, 1)[0]);
            break;
          }
        }
      });

      lib.libBooksArr = [...uniqTmpLibBooksArr, ...tmpLibBooksArr]; // соединяем вначале уникальные значения затем повторяющиеся

      // console.log('AFTER', lib.libBooksArr);

      // lib.libBooksArr = lib.libBooksArr
        // .filter( ( el ) => !uniqLeftPartArrValues.includes( el ) )
        // .sort((a, b) => b - a)

      if (lib.libBooksArr.length) {
        if (lib.libBooksArr.length > ((deadline - sumOfSignUps) * lib.perDay)) {
          lib.libBooksArr = lib.libBooksArr.slice(-leftLibArrayPart[leftLibArrayPart.length - 1].signUpProcess)
        }

        lib.coefficient = uniqTmpLibBooksArr.reduce((accumulator,currentValue) => {
          return accumulator + currentValue / maxBookWeight
        }, 0) // пересчет коеффициента каждой библиотеки
      } else {
        lib.coefficient = 0; // пересчет коеффициента каждой библиотеки
      }
    });

    // console.log('leftLibArrayPart', leftLibArrayPart);
    // console.log('rightLibArrayPart', rightLibArrayPart);


    rightLibArrayPart = rightLibArrayPart.sort((a, b) => { // сортируем массив библиотек по коеффициенту от большего к меньшему
      return b.coefficient - a.coefficient;
    });

    libraries = [...leftLibArrayPart, ...rightLibArrayPart];

    libraries = libraries.sort((a, b) => { // сортировка библиотек по индексу от большего к меньшему
      return b.coefficient - a.coefficient;
    });

    splitCount++;
  }

  // console.log('libraries', libraries.map(el => el.libBooksArr));
}

function clrOutputDirectory() {
  const directory  = 'out';

  fsExtra.emptyDirSync(directory)
}

function setOutputData() {
  outPut += libraries.length + '\n';

  libraries.forEach((lib, index) => {
    outPut += lib.libStarterIndex + ' ' + lib.libBooksArr.length + '\n';
    outPut += lib.libBooksArr.toString().replace(/,/g, ' ') + '\n';
  });
}

function saveData(fName) {
  fsExtra.outputFileSync('out/' + fName, outPut)
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

    libBooksArr.push(...line.split(' ').map(item => booksArray[parseInt(item)])); // заполнение массива книг библиотеки весами книг из массива весов книг =)
    sortLibBooksArr(); // сортировка книг по весу от большего к меньшему
    setCoefficient(); // вычисление коеффициента каждой библиотеки

    index = remaining.indexOf('\n');

    libraries.push({
      libStarterIndex,
      ...tmpLibData,
      libBooksArr
    });

    // console.log('libBooksArr', libBooksArr)

    libStarterIndex++;
  }

  sortLibrariesByCoefficient();

  setOutputData();
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
