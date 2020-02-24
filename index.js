const fsExtra = require('fs-extra');
const JSZip = require('jszip');

let libraries = [];
let booksArray = [];
let booksCount = null;
let libsCount = null;
let deadline = null;
let tmpDeadline = 0;
let outPut = '';
let tmpUniq = [];
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
    console.log(outPut);
}

function sortLibBooksArrSetCoefficient() {
    tmpDeadline = deadline;

    console.log(splitCount);

    for (let i = splitCount; i < libraries.length; i++) {
        if (!libraries[i].libBooksArr.length) break;
        if (tmpDeadline <= libraries[i].signUpProcess) break;

        tmpDeadline = tmpDeadline - libraries[i].signUpProcess;

        libraries[i].libBooksArr = libraries[i].libBooksArr.slice(0, tmpDeadline * libraries[i].perDay); // сортируем массив весов книг от большего к меньшему

        // libraries[i].libBooksArr = libraries[i].libBooksArr.filter(el => {
        //     return !tmpUniq.includes(el);
        // });

        // if (tmpUniq.length > 50) tmpUniq = tmpUniq.slice(tmpUniq.length / 2, tmpUniq.length);

        // tmpUniq = Array.of(...new Set(Array.of(...tmpUniq, ...libraries[i].libBooksArr)));

        libraries[i].coefficient = libraries[i].libBooksArr.reduce((accumulator, currentValue) => {
            return accumulator + booksArray[currentValue];
        }, 0);
    }

    libraries = [
        ...libraries.slice(0, splitCount),
        ...(libraries.slice(splitCount).sort((a, b) => b.coefficient - a.coefficient))
    ];
}

function sortLibrariesByCoefficient() {
    if (splitCount > libsCount) {
        libraries = libraries.filter((a) => a.coefficient > 0);
        return;
    }

    sortLibBooksArrSetCoefficient(splitCount, libraries);

    if (splitCount === 1) {
        libraries = libraries.sort((a, b) => b.libBooksArr.length - a.libBooksArr.length);
    }

    splitCount++;

    sortLibrariesByCoefficient();
}

function clearAndSaveData() {
    // fsExtra.removeSync('./hash_code_2020.zip');

    fsExtra.remove('./hash_code_2020.zip')
        .then(() => {
            console.log('removed hash_code_2020.zip');
            const directory  = 'out';

            fsExtra.emptyDirSync(directory);
            console.log('success!');
        })
        .then(() => {
            console.log('created hash_code_2020.zip');
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
            console.log('success!');
        })
        .catch(err => {
            console.error(err)
        })

}

function setOutputData() {                  //########################## setOutputData ##############################
    outPut = '';

    let tmpSendBooksCount = 0;
    let tmpDeadline = deadline;

    let i = 0;
    for (i = 0; i < libraries.length; i++) {
        tmpDeadline -= libraries[i].signUpProcess;
        tmpSendBooksCount = tmpDeadline * libraries[i].perDay;

        if (tmpDeadline > 0) {
            outPut += libraries[i].libStarterIndex + ' ' + libraries[i].libBooksArr.slice(0, tmpSendBooksCount).length + '\n';
            outPut += libraries[i].libBooksArr.slice(0, tmpSendBooksCount).toString().replace(/,/g, ' ') + '\n';
        } else {
            console.log('BREAK');
            break;
        }
    }

    console.log(i);

    outPut = i + '\n' + outPut;
}

function readLines(input) {
    let libBooksArr = [];
    let tmpLibData = {};
    let remaining = '';
    let libStarterIndex = 0;
    let index = null;
    let line = null;

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

    remaining = remaining.substring(index + 1);
    index = remaining.indexOf('\n');

    while (index > 0) {
        tmpLibData = {};
        libBooksArr = [];

        line = remaining.substring(0, index).split(' ');

        tmpLibData = {
            booksCount: parseInt(line[0]),
            signUpProcess: parseInt(line[1]),
            perDay: parseInt(line[2])
        };

        remaining = remaining.substring(index + 1);
        index = remaining.indexOf('\n');

        line = remaining.substring(0, index).split(' ');

        libBooksArr = Array.of(...new Set([...line.map(item => parseInt(item))]));
        libBooksArr = libBooksArr.sort((a, b) => {
            return booksArray[b] - booksArray[a];
        });

        tmpLibData.coefficient = libBooksArr.reduce((accumulator, currentValue) => {
            return accumulator + booksArray[currentValue];
        }, 0);

        remaining = remaining.substring(index + 1);

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

clearAndSaveData();

function saveOutputFile(fName) {
    console.log(fName);
    fsExtra.outputFileSync('out/' + fName, outPut)
}

fileNames.forEach(fName => {
    fsExtra.readFile('in/' + fName, 'utf8', (err, data) => {
        if (err) throw err;
        readLines(data);
        showCalculatedData();
        saveOutputFile(fName);
    });
});
