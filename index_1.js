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
  console.log('booksCount:', booksCount);
  console.log('libsCount:', libsCount);
  console.log('deadline:', deadline);
  // console.log('booksArray:', booksArray);
  console.log('maxBookWeight:', maxBookWeight);
  // console.log('libraries:', libraries);
  console.log(outPut);
};

function sortLibBooksArr() {
  libBooksArr = libBooksArr.sort((a, b) => { // сортируем массив весов книг от большего к меньшему
    return booksArray[b] - booksArray[a];
  })
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

  libBooksArr = [...tmpUniq, ...tmpArr];

  tmpLibData.coefficient = tmpUniq.reduce((accumulator, currentValue) => {
    return accumulator + booksArray[currentValue] / maxBookWeight
  }, 0);
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
  let leftLibArrayPart = [];
  let rightLibArrayPart = [];
  let sumOfSignUps = 0;
  let splitCount = 1;
  let uniqLeftPartArrValues = [];

  let maxCoefficientVal = Math.max(...libraries.map(val => val.coefficient));

  moveLibWithMaxCoefficientToFirst(maxCoefficientVal);

  let tmpLibBooksArr = [];
  let nonUniqTmpLibBooksArr = []; // уникальные значения в массиве книг одной библиотеки

  while (sumOfSignUps < deadline && splitCount <= libsCount) {
    leftLibArrayPart = [];
    rightLibArrayPart = [];
    // sumOfSignUps = 0;

    leftLibArrayPart = [...libraries.slice(0, splitCount)]; // левая часть библиотеки

    sumOfSignUps += leftLibArrayPart[leftLibArrayPart.length - 1].signUpProcess

    console.log('sumOfSignUps', sumOfSignUps, deadline, sumOfSignUps < deadline);
    console.log('splitCount', splitCount, libsCount, splitCount <= libsCount);

    // sumOfSignUps = leftLibArrayPart.reduce((accumulator, currentValue) => { // сумма signUpProcess левой части массива библиотек
    //   if (!currentValue) return;
    //   return accumulator + currentValue.signUpProcess;
    // }, 0);

    uniqLeftPartArrValues = [...Array.of(...new Set([...uniqLeftPartArrValues, leftLibArrayPart[leftLibArrayPart.length - 1].libBooksArr].flat()))]; // поиск уникальных значений в последней библиотеке левой части массива

    rightLibArrayPart = [...libraries.slice(splitCount)]; // правая часть библиотеки

    rightLibArrayPart.forEach(lib => {
      tmpLibBooksArr = [...lib.libBooksArr];
      nonUniqTmpLibBooksArr = [];

      uniqLeftPartArrValues.forEach((val) => {
        for (let i = 0; i < tmpLibBooksArr.length; i++) {
          if (val === tmpLibBooksArr[i]) {
            let tmp = tmpLibBooksArr.splice(i, 1)[0];
            i -= 1;
            nonUniqTmpLibBooksArr.push(tmp);
            // break;
          }
        }
      });

      lib.libBooksArr = [...tmpLibBooksArr, ...nonUniqTmpLibBooksArr]; // соединяем вначале уникальные значения затем повторяющиеся

      if (lib.libBooksArr.length) {
        // if (lib.libBooksArr.length > ((deadline - sumOfSignUps) * lib.perDay)) {
        //   lib.libBooksArr = lib.libBooksArr.slice(-leftLibArrayPart[leftLibArrayPart.length - 1].signUpProcess)
        // }

        lib.coefficient = tmpLibBooksArr.reduce((accumulator, currentValue) => {
          return accumulator + currentValue / maxBookWeight
        }, 0) // пересчет коеффициента каждой библиотеки
      } else {
        lib.coefficient = 0; // пересчет коеффициента каждой библиотеки
      }
    });

    rightLibArrayPart = rightLibArrayPart.sort((a, b) => { // сортируем массив библиотек по коеффициенту от большего к меньшему
      return b.coefficient - a.coefficient;
    });

    libraries = [...leftLibArrayPart, ...rightLibArrayPart];

    // libraries = libraries.sort((a, b) => { // сортировка библиотек по индексу от большего к меньшему
    //   return b.coefficient - a.coefficient;
    // });

    splitCount++;
  }
}

function clrOutputDirectory() {
  const directory  = 'out';

  fsExtra.emptyDirSync(directory)
}

function setOutputData() {                  //########################## setOutputData ##############################
  console.log('SET OUTPUT')

  outPut = '';

  let tmpCountOfPositiveCoefficient = 0;
  let tmpSendBooksCount = 0;
  let tmpDeadline = deadline;

  libraries.forEach(lib => {
    tmpDeadline -= lib.signUpProcess;
    tmpSendBooksCount = tmpDeadline * lib.perDay;

    if (lib.coefficient > 0 && tmpDeadline > 0) {
      tmpCountOfPositiveCoefficient++;
      outPut += lib.libStarterIndex + ' ' + lib.libBooksArr.slice(0, tmpSendBooksCount).length + '\n';
      outPut += lib.libBooksArr.toString().replace(/,/g, ' ') + '\n';
    }

    // if (tmpDeadline <= 0) {
    //   outPut += lib.libStarterIndex + ' ' + 0 + '\n';
    //   outPut += lib.libBooksArr.toString().replace(/,/g, ' ') + '\n';
    // }
  });

  outPut = tmpCountOfPositiveCoefficient + '\n' + outPut;

  // libraries.forEach((lib, index) => {
  //   outPut += lib.libStarterIndex + ' ' + lib.libBooksArr.length + '\n';
  //   outPut += lib.libBooksArr.toString().replace(/,/g, ' ') + '\n';
  // });
}

function saveData(fName) {
  fsExtra.outputFileSync('out/' + fName, outPut)
}

function readLines(input) {
  let remaining = '';

  libraries = [];
  remaining += input;

  index = remaining.indexOf('\n');
  line = remaining.substring(0, index).split(' ');

  booksCount = parseInt(line[0]);
  libsCount = parseInt(line[1]);
  deadline = parseInt(line[2]);

  remaining = remaining.substring(index + 1);
  index = remaining.indexOf('\n');

  line = remaining.substring(0, index);

  booksArray = [...line.split(' ').map(item => parseInt(item))];
  maxBookWeight = Math.max(...booksArray);

  remaining = remaining.substring(index + 1);
  index = remaining.indexOf('\n');

  while (index > 0) {
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

    line = remaining.substring(0, index).split(' ');
    remaining = remaining.substring(index + 1);

    libBooksArr = [...line.map(item => parseInt(item))];
    // libBooksArr.push(...line.split(' ').map(item => booksArray[parseInt(item)])); // заполнение массива книг библиотеки весами книг из массива весов книг =)
    sortLibBooksArr(); // сортировка книг по весу от большего к меньшему
    setCoefficient(); // вычисление коеффициента каждой библиотеки

    index = remaining.indexOf('\n');

    libraries.push({
      libStarterIndex,
      ...tmpLibData,
      libBooksArr
    });

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

clrOutputDirectory();

fileNames.forEach(fName => {
  fsExtra.readFile('in/' + fName, 'utf8', (err, data) => {
    if (err) throw err;
    readLines(data);
    showCalculatedData();
    saveData(fName);
  });
})
