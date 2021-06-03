// оно старое, нам не надо сейчас

const fs = require('fs');
const {google} = require('googleapis');
const credentials = require("./gl keys/credentials.json");
const token = require('./gl keys/token.json');
const groupes = require('./PWA_site_proto/sourses/groupes.json');

let checkEmptyObject = (obj) => (obj ? !Object.keys(obj).length < 1 : false); // возвращает false, если объект пустой, или его не существует

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let doubleLetters = [];
for(let j = 0; j < letters.length; j++){
    for(let n = 0; n < letters.length; n++)
        doubleLetters.push(`${letters[j]}${letters[n]}`);
}

letters = letters.concat(doubleLetters);

async function authorize() {
    const {client_secret, client_id, redirect_uris} = credentials;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

async function getLessons(startLetter, endLetter) {
    let auth = await authorize();
    const sheets = google.sheets({version: 'v4', auth});
    let properties = {
        spreadsheetId: '1uebUDAixmx3RHUtxbMD2mEB96DxdaZBlpDFf5IZQBfQ',
        range: `${startLetter}5:${endLetter}71`
    };

    let getWeek = (res) => {
        createLesson = (aud, place, title, teacher, count = 0) =>({
            title: title,
            aud:aud,
            place: place,
            count:count,
            teacher: teacher,
        })
        let week = {'понедельник':[], 'вторник':[], 'среда':[], 'четверг':[], 'пятница':[]}
        let weekKeys = Object.keys(week);
        
        let results = res.data.values;
        
        
        let j = 0;
        let count = 1;
        for(let i = 0; i < weekKeys.length; i++){
            for(; j < results.length; j+=2){
                if(count > 7){
                    count = 1;
                    break;
                }else{
                    if(!results[j+1]) break
                    week[weekKeys[i]].push(createLesson(results[j+1][1], results[j][1], results[j][0], results[j+1][0], count));
                    count++;
                }
            }
        }

        for(i = 0; i < weekKeys.length; i++){
            let currentLessons = [];
            for(j = 0; j < week[weekKeys[i]].length; j++){
                if(week[weekKeys[i]][j].title){
                    currentLessons.push(week[weekKeys[i]][j]);
                } 
            }
            week[weekKeys[i]] = currentLessons;
        }
        return week;
    }

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get(properties, (err, res) => {
            if (err) reject(err);
            else resolve(getWeek(res));
        });
    });
}

// for(let i = 4; i < groupes.length*2+4; i+=2){
//     let currentGroupe = groupes[(i-4)/2]
//     getLessons(letters[i], letters[i+1], currentGroupe)
//     .then(result => {
//         fs.writeFileSync(`PWA_site_proto/sourses/${currentGroupe}_week.json`, JSON.stringify(result));
//         // console.log(result);
//     })
//     .catch(console.log);
// }

function getGroupes(auth){
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: '1uebUDAixmx3RHUtxbMD2mEB96DxdaZBlpDFf5IZQBfQ',
        range: `E4:CX4`
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        let [results] = res.data.values;
        let groupes = [];
        
        for(let i = 0; i < results.length; i++){
            console.log(!(results[i].includes('Ауд')));
            if(!(results[i].includes('Ауд'))){
                groupes.push(results[i]);
            }      
        }
        // console.log(groupes);
        fs.writeFileSync('groupes.json', `${JSON.stringify(groupes)}`);
    })
}

createLesson = (aud, place, title, teacher, count = 0) =>{
    let lesson = {
        title: title,
        teacher: teacher,
        place: place,
        aud:aud,
    }
    if(count !== null)
        lesson.count = count;
    
    return lesson
}
async function getDataWithFormat(startLetter, endLetter){
    let auth = await authorize();
    const sheets = google.sheets({version: 'v4', auth});
    let properties = {
        spreadsheetId: '1uebUDAixmx3RHUtxbMD2mEB96DxdaZBlpDFf5IZQBfQ',
        ranges: [`'Расписание'!${startLetter}5:${endLetter}71`],
        includeGridData: true
    };

    let spreadsheet = (await sheets.spreadsheets.get(properties));
    let result = spreadsheet.data.sheets[0].data[0].rowData;

    let log = [];


    let week = {'понедельник':[], 'вторник':[], 'среда':[], 'четверг':[], 'пятница':[]}
    let weekKeys = Object.keys(week);
    
    function checkForLesson(index, checkConditionalFunction){
        let results = [false];
        let cells = [result[index].values[0], result[index+1].values[0], result[index].values[1], result[index+1].values[1]];

        for(let i = 0; i < cells.length; i++){
            if(checkConditionalFunction(cells[i])){
                results[0] = true;
                results.push(cells[i])
            }
        }
        return results
    }
    
    let getCellValue = (cell) => (cell.effectiveValue ? Object.values(cell.effectiveValue)[0] : undefined)
    
    let j = 0;
    let count = 1;

    for(let i = 0; i < weekKeys.length; i++){
        for(; j < result.length; j+=2){
            if(count > 7){
                count = 1;
                break;
            }
            count++;
            if(!result[j+1]) break;
            if(!result[j].values[0].effectiveValue){
                continue
            } 

            let checkIfIsColor = (cell) => {
                return (cell.textFormatRuns || checkEmptyObject(cell.userEnteredFormat.textFormat.foregroundColor))
            };
            let coloredCells = checkForLesson(j, checkIfIsColor);
            if(!coloredCells[0]){
                week[weekKeys[i]].push(createLesson(getCellValue(result[j+1].values[1]), getCellValue(result[j].values[1]), getCellValue(result[j].values[0]), getCellValue(result[j+1].values[0]), count-1));
            }else{
                coloredCells.shift();
                
                let lesson = {
                    RED: createLesson(getCellValue(result[j+1].values[1]), getCellValue(result[j].values[1]), getCellValue(result[j].values[0]), getCellValue(result[j+1].values[0]), null),
                    BLUE: createLesson(getCellValue(result[j+1].values[1]), getCellValue(result[j].values[1]), getCellValue(result[j].values[0]), getCellValue(result[j+1].values[0]), null),
                    count: count-1
                }

                let lessonIsOneColor = true;
                for(cell of coloredCells){
                    if(!cell.textFormatRuns)
                        continue
                    else if(!checkEmptyObject(cell.textFormatRuns[0].format) && (cell.textFormatRuns.length <= 2))    
                        continue

                    lessonIsOneColor = false;
                }

                let checkCellIfIsRed = (cell) => (cell.userEnteredFormat.textFormat.foregroundColor ? 
                    (cell.userEnteredFormat.textFormat.foregroundColor.red === 1 || cell.userEnteredFormat.textFormat.foregroundColor.red === 0.91764706) : 
                    false) 

                if(lessonIsOneColor){
                    if(checkForLesson(j, checkCellIfIsRed)[0]){
                        delete lesson['BLUE'];
                    }else{
                        delete lesson['RED'];
                    }
                }else{
                    let lessonCells = [result[j].values[0], result[j+1].values[0], result[j].values[1], result[j+1].values[1]];

                    fs.writeFileSync('log.json', JSON.stringify(lessonCells))
                    
                    for(let i = 0; i < lessonCells.length; i++){
                        let currentCell = lessonCells[i];
                        let currentFirstColor;
                        let currentSecondColor;
                        let splitStartIndex;

                        if(currentCell.textFormatRuns){
                            for(let k = 0; k < currentCell.textFormatRuns.length; k++){
                                let pieceFormat = currentCell.textFormatRuns[k];

                                if(!pieceFormat.format.foregroundColor){
                                    continue
                                }else{
                                    if(pieceFormat.format.foregroundColor.red == 1 || pieceFormat.format.foregroundColor.red == 0.91764706){
                                        currentFirstColor = 'RED';
                                        currentSecondColor = 'BLUE';
                                    }else{
                                        currentFirstColor = 'BLUE';
                                        currentSecondColor = 'RED';                       
                                    }

                                    if(currentCell.textFormatRuns[k+1])
                                        splitStartIndex = currentCell.textFormatRuns[k+1].startIndex;
                                    else{
                                        splitStartIndex = pieceFormat.startIndex;
                                        [currentFirstColor, currentSecondColor] = [currentSecondColor, currentFirstColor];
                                    }
                                    break
                                }
                            }
                        }
                        let coloredLessonKeys = Object.keys(lesson['RED']);
                        if(currentFirstColor && currentSecondColor){
                            lesson[currentFirstColor][coloredLessonKeys[i]] = lesson[currentFirstColor][coloredLessonKeys[i]].substr(0, splitStartIndex);
                            lesson[currentSecondColor][coloredLessonKeys[i]] = lesson[currentSecondColor][coloredLessonKeys[i]].substr(splitStartIndex);
                        }
                    }
                    for(color in lesson){
                        if(color.title){
                            if(color.title.length < 3){
                                delete color;
                            }
                        }
                    }
                }
                week[weekKeys[i]].push(lesson);
            }
            log.push([result[j].values[0], result[j+1].values[0], result[j].values[1], result[j+1].values[1]]);
        }
    }

    return [week, log]
    // fs.writeFileSync('response.json', JSON.stringify(response));
}

// getDataWithFormat('BM', 'BN').then(result => {
//     fs.writeFileSync('test.json', JSON.stringify(result[0]));
//     fs.writeFileSync('testLog.json', JSON.stringify(result[1]));
// });

(async () => {
    let studentsWeeks = {};
    
    for(let i = 4; i < groupes.length*2+4; i+=2){
        let currentGroupe = groupes[(i-4)/2];
        let result = await getDataWithFormat(letters[i], letters[i+1]);
        // .then(result => {
        //     // fs.writeFileSync(`PWA_site_proto/sourses/weeks/${currentGroupe}_week.json`, JSON.stringify(result[0]));
            studentsWeeks[currentGroupe] = result[0];
        //     // fs.writeFileSync(`testLessonsLogs/${currentGroupe}_log.json`, JSON.stringify(result[1]));
        // })
        // .catch(console.log);
    }
    // console.log(studentsWeeks);
    let teachersWeeks = {};
    for(let i = 1; i < groupes.length; i++){
        let curentGroupeWeek = studentsWeeks[groupes[i]];
        // console.log(curentGroupeWeek);
    
        for(day of ['понедельник', 'вторник', 'среда', 'четверг', 'пятница']){
            for(lesson of curentGroupeWeek[day]){
                let isTeacher = false;    
                let currentTeacher;
                // console.log(lesson);

                lesson.groupe = groupes[i];
                
                for(teacher of Object.keys(teachersWeeks)){
                    if(checkEmptyObject(teachersWeeks)) break;
                    if(teacher.includes(lesson.teacher) || lesson.teacher.includes(teacher)){
                        isTeacher = true;
                        currentTeacher = teacher;
                        break
                    }
                }
                
                if(!isTeacher){
                    // console.log(currentTeacher);
                    teachersWeeks[currentTeacher] = {'понедельник':[], 'вторник':[], 'среда':[], 'четверг':[], 'пятница':[]};
                    teachersWeeks[currentTeacher][day] = [lesson];
                }else{
                    teachersWeeks[lesson.teacher][day].push(lesson);
                }

                delete lesson.teacher;
            }
        }
    }
    fs.writeFileSync('testTeacherWeek.json', JSON.stringify(teachersWeeks))
})()