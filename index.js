const fsExtra = require('fs-extra');
const fs = require('fs');
const JSZip = require("jszip");

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
let splitCount = 0;
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
};

let tmpUniq = [];
let tmpArr = [];

function sortLibBooksArrSetCoefficient() {
  let tmp = 0;

  for (let i = 0; i < libBooksArr.length; i++) {
    tmp = deadline - libBooksArr[i].signUpProcess;

    libBooksArr = libBooksArr.slice(tmp).sort((a, b) => { // сортируем массив весов книг от большего к меньшему
      return booksArray[b] - booksArray[a];
    });

    tmpLibData.coefficient = libBooksArr.reduce((accumulator, currentValue) => {
      return accumulator + parseFloat((booksArray[currentValue] / maxBookWeight).toFixed(4))
    }, 0);
  }

  // tmpUniq = Array.of(...new Set(libBooksArr));
  // tmpArr = [...libBooksArr];
  //
  // tmpUniq.forEach(el => {
  //   for (let i = 0; i < tmpArr.length; i++) {
  //     if (tmpArr[i] === el) {
  //       tmpArr.splice(i, 1)[0];
  //       break;
  //     }
  //   }
  // });
  //
  // libBooksArr = [...tmpUniq, ...tmpArr];
  //
  // tmpLibData.coefficient = tmpUniq.reduce((accumulator, currentValue) => {
  //   return accumulator + parseFloat((booksArray[currentValue] / maxBookWeight).toFixed(4))
  // }, 0);
}

function startBooksCount(tmpLibData) { // количество книг отправленых библиотекой если она будет первой для входа
  return (deadline - tmpLibData.signUpProcess) * tmpLibData.perDay
}

let sumOfSignUps = 0;
let left = [];
let leftUniqValues = [];
let right = [];
splitCount = 0;

function sortLibrariesByCoefficient() {
  if (sumOfSignUps >= deadline || splitCount >= libsCount) return;

  // if (!splitCount) {
  //   libraries = libraries.sort((a, b) => parseFloat(b.coefficient) - parseFloat(a.coefficient));
  //   // console.log(libraries[0].coefficient);
  //   libraries[0].libBooksArr = [...new Set([...libraries[0].libBooksArr])];
  //   // console.log(libraries[0].libBooksArr);
  // }

  // left = libraries.slice(0, splitCount);
  //
  // if (left.length) {
  //   leftUniqValues = [...new Set([...leftUniqValues, ...left[left.length - 1].libBooksArr])];
  //
  //   // console.log('leftUniqValues', leftUniqValues)
  //
  //   right = libraries.slice(splitCount);
  //
  //   sumOfSignUps += left[left.length - 1].signUpProcess;
  //
  //   for (let i = 0; i < right.length; i++) {
  //     if ((right[i].signUpProcess + sumOfSignUps < deadline) && right[i].coefficient > 0) {
  //       right[i].libBooksArr = right[i].libBooksArr.filter(el => !leftUniqValues.includes(el))
  //       // console.log(right[i].libBooksArr)
  //       if (right[i].libBooksArr.length) {
  //         right[i].coefficient = right[i].libBooksArr.reduce((accumulator, currentValue) => {
  //           return accumulator + parseFloat((booksArray[currentValue] / maxBookWeight).toFixed(4))
  //         }, 0);
  //       } else {
  //         right[i].coefficient = 0;
  //       }
  //     }
  //   }
  //
  //   right = right.filter(el => el.coefficient > 0).sort((a, b) => parseFloat(b.coefficient) - parseFloat(a.coefficient));
  //
  //   libraries = [...left, ...right];
  //
  //   if (leftUniqValues.length === booksArray.length) return;
  // }
  //
  // splitCount++;
  //
  // sortLibrariesByCoefficient();
}

function clrOutputDirectory() {
  let zip = new JSZip();

  zip.file("index.js", fsExtra.readFileSync("index.js"));
  zip.file("package-lock.json", fsExtra.readFileSync("package-lock.json"));
  zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fsExtra.createWriteStream('hash_code_2020.zip'))
    .on('finish', function () {
      // JSZip generates a readable stream with a "end" event,
      // but is piped here in a writable stream which emits a "finish" event.
      console.log("out.zip written.");
    });

  const directory  = 'out';

  fsExtra.emptyDirSync(directory)
}

function setOutputData() {                  //########################## setOutputData ##############################
  outPut = '';
  // outPut += libraries.length + '\n';

  let tmpSendBooksCount = 0;
  let tmpDeadline = deadline;

  // console.log(libraries.length)
  let i = 0;
  for (i = 0; i < libraries.length; i++) {
    tmpDeadline -= libraries[i].signUpProcess;
    tmpSendBooksCount = tmpDeadline * libraries[i].perDay;

    // console.log('tmpDeadline', tmpDeadline)

    if (tmpDeadline > 0) {
      outPut += libraries[i].libStarterIndex + ' ' + libraries[i].libBooksArr.slice(0, tmpSendBooksCount).length + '\n';
      outPut += libraries[i].libBooksArr.slice(0, tmpSendBooksCount).toString().replace(/,/g, ' ') + '\n';
    } else {
      console.log('BREAK')
      break;
    }
  }

  console.log(i)

  outPut = i + '\n' + outPut;
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
    sortLibBooksArrSetCoefficient(); // сортировка книг по весу от большего к меньшему вычисление коеффициента каждой библиотеки

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
  // 'a_example.txt',
  // 'b_read_on.txt',
  // 'c_incunabula.txt',
  // 'd_tough_choices.txt',
  // 'e_so_many_books.txt',
  'f_libraries_of_the_world.txt'
];

clrOutputDirectory();

fileNames.forEach(fName => {
  fsExtra.readFile('in/' + fName, 'utf8', (err, data) => {
    if (err) throw err;
    readLines(data);
    showCalculatedData();
    saveData(fName);
  });
});
