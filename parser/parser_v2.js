// эта штука уже настроена брать данные откуда надо и класть куда надо, главное запустить

const fs = require('fs');
const {google} = require('googleapis');
const credentials = require("./gl keys/credentials.json");
const token = require('./gl keys/token.json');

async function authorize() {
    const {client_secret, client_id, redirect_uris} = credentials;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

(async function getAllLessons(){
    let auth = await authorize();
    const sheets = google.sheets({version: 'v4', auth});

    let properties = {
        spreadsheetId: '1e4WD0exf55EvrbHubpUl0bqfwq73oSWPKFD9XD5JXsU',
    };

    let writeArr = (arr) => {
        path = `output/${arr.shift()}.json`;
        if(!fs.existsSync(path))
            fs.writeFileSync(path, JSON.stringify(arr));
    }

    // функция для получения преподавателей, групп и кабинетов
    async function getLessonsElems(list){
        properties.range = `'${list}'!A:A`

        processFunc = (res) =>{
            let resultArr = [list];

            res.splice(0,2);
            for(let i = 0; i < res.length; i+=7){
                let currentElem = res[i][0].replace(/^\s/, '').split(' ', 2);
                if(list == 'cabs') 
                    currentElem = currentElem.join(' ')
                else{
                    if(currentElem.length > 1)
                        if(!currentElem[1].includes('.')) currentElem.pop();
                    currentElem = currentElem.join(' ');
                }


                if(!resultArr.includes(currentElem)) resultArr.push(currentElem);
            }

            return resultArr;
        }

        return new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get(properties, (err, res) => {
                if (err) reject(err);
                else resolve(processFunc(res.data.values));
            })
        })
    }
    let teachers = await getLessonsElems('teachers');
    // teachers.shift();
    writeArr(teachers);

    let groupes = await getLessonsElems('groupes');
    
    let cabs = await getLessonsElems('cabs');
    cabs.shift();
    writeArr(groupes);
    
    async function getLessons(list) {
        properties.range = `'${list}'!A3:P359`;
    
        let processFunc = (res) => {
            let group = res[0][0]; 
            let week = {'понедельник':[], 'вторник':[], 'среда':[], 'четверг':[], 'пятница':[], 'суббота': []};
            let weekKeys = Object.keys(week);
            
            let count = 0;
            for(let i = 0; i < res.length; i++){

                let currentRow = res[i];

                count++;
                if(count > 7){
                    // console.log(week);
                    if(week['суббота'].length == 0) delete week['суббота'];
                    if(!group.includes('ОН')) fs.writeFileSync(`output/weeks/${group}_week.json`, JSON.stringify(week));
                    week = {'понедельник':[], 'вторник':[], 'среда':[], 'четверг':[], 'пятница':[], 'суббота': []};
                    count = 1;
                    group = currentRow[0];
                }
                
                if(group.includes('ОН')) continue
                
                function parseRow(startIndex){
                    let lessonRow = [];
                    for(let j = startIndex; j < (startIndex + weekKeys.length); j++){
                        let currentCell = currentRow[j]; 
                        
                        function parseCell(cell){
                            let lesson;
                            if(cell){
                                lesson = {};
                                cell = cell.trim().replace(/\s+/g, ' ');
                                for(let groupForReplace of groupes){
                                    cell = cell.replace(new RegExp(`\\s*${[].map.call(groupForReplace, (letter) => (letter === '+' ? '\\' + letter + '\\s*' : letter + '\\s*')).join('')}`, 'gi'), ' _g_ ');
                                }
                                
                                // определение учителя
                                for(let teacher of teachers){
                                    let [surname, initials] = teacher.split(' ');
                                    let surnameIsRepeated = 0;
                                    teachers.forEach(elem => {if(elem.includes(surname)) surnameIsRepeated++});
                                    if(surnameIsRepeated == 1){
                                        initials = undefined;
                                        teacher = surname
                                    }
                            
                                    if(initials){
                                        let surnameRegExp = new RegExp([].map.call(surname, (letter) => (letter + '.?')).join(''), 'i');
                                        if(cell.match(surnameRegExp)){
                                            let letter1 = initials.split('.')[0];
                                            let splitedStr = cell.split(' ');
                                            
                                            if(splitedStr[splitedStr.indexOf(cell.match(surnameRegExp)[0]) + 1].includes(letter1)){
                                                cell = cell.replace(new RegExp(`${surnameRegExp}\\s*${letter1}?\\.?`), ' _t_ ');
                                                lesson.teacher = teacher;
                                                break
                                            }
                                        }
                                    }else{
                                        let teacherRegExp = new RegExp([].map.call(teacher, (letter) => (letter + '.?')).join(''), 'i');
                                        if(cell.match(teacherRegExp)){
                                            cell = cell.replace(teacherRegExp, ' _t_ ');
                                            lesson.teacher = teacher;
                                            break
                                        }
                                    }
                                }
                                let foundedAuds = [];
                                for(let cab of cabs){
                                    let [part1, part2] = cab.split(' ');
                                    if(!part2) part2 = ''
                                    let [part1OfPart2, part2OfPart2] = part2.split('.');
                                    part2OfPart2 = part2OfPart2 ?  `\\s*[.ю,]\\s*${part2OfPart2}` : '';
                                    let cellCabs = cell.match(new RegExp((part2 == 'кабинет') ? `${part1}\\s*к?а?б?и?н?е?т?` : `${part1}\\s*${part1OfPart2 ? part1OfPart2 : ''}${part2OfPart2}`,'gi'));
                                    if(cellCabs){
                                        for(let cellCab of cellCabs) cell = cell.replace(cellCab, ' _c_ ')
                                        
                                        foundedAuds.push(cab);
                                    }
                                }
                                lesson.aud = foundedAuds.join('/').trim();
                        
                                let titleEndIndex = cell.search(/_[tgc]_/i);
                                lesson.title = cell.slice(0, titleEndIndex).trim();
                        
                                while(!lesson.title || lesson.title.length < 3){
                                    cell = cell.replace(/_[tgc]_/i, '');
                                    
                                    titleEndIndex = cell.search(/_[tgc]_/i);
                                    lesson.title = cell.slice(0, titleEndIndex).trim();
                                    if(titleEndIndex = -1) break
                                }
                            }
                            return lesson
                        }

                        let lessonToCollect;
                        if(currentCell){
                            lessonToCollect = {};
                            if(currentCell.match(/\s*\+\s*/g)){
                                let splittedCell = currentCell.split(/\s*\+\s*/g);
                                for(let piece of splittedCell){
                                    // console.log(piece);
                                    let processedPiece = parseCell(piece);
                                    if(processedPiece){
                                        if(processedPiece.title){    
                                            if(!processedPiece.title.match(/^\s*$/)){

                                                lessonToCollect.title = processedPiece.title;
                                            }
                                        }
                                        for(let prop in processedPiece){
                                            if(prop !== 'title'){
                                                if(processedPiece[prop].trim()){
                                                    if(!lessonToCollect[prop]) 
                                                        lessonToCollect[prop] = `${processedPiece[prop] ? processedPiece[prop] : ''}/`;
                                                    else
                                                        lessonToCollect[prop] += `${processedPiece[prop] ? processedPiece[prop] : ''}/`;    
                                                }
                                            }
                                        }
                                    }
                                }
                                for(let prop in lessonToCollect){
                                    lessonToCollect[prop] = lessonToCollect[prop].trim().split('/').join('/');
                                    lessonToCollect[prop] = lessonToCollect[prop].replace(/\/$/, '');
                                }
                            }else{
                                lessonToCollect = parseCell(currentCell);
                            }

                            if(!lessonToCollect.aud || lessonToCollect.aud.match(/^\s*$/)) lessonToCollect.place = 'Онлайн'
                            else if(lessonToCollect.aud.includes('кабинет')) lessonToCollect.place = 'Курская';
                            else lessonToCollect.place = 'ВДНХ';
                        }
                        lessonRow.push(lessonToCollect);
                    }
                    return lessonRow
                }

                let redRow = parseRow(2);
                let blueRow = parseRow(9);

                for(let i = 0; i < weekKeys.length; i++){
                    let lesson = {count: count};
                    if(redRow[i]) lesson.RED = redRow[i];
                    if(blueRow[i]) lesson.BLUE = blueRow[i];

                    if((lesson.RED && Object.keys(lesson.RED).length > 0) && (lesson.BLUE && Object.keys(lesson.BLUE).length > 0)){
                        let colorsIsSimilar = true;
                        if(Object.keys(lesson.RED).length != Object.keys(lesson.BLUE).length){
                            colorsIsSimilar = false;
                            break
                        }

                        for(let j = 0; j < Object.keys(lesson.RED).length; j++){
                            // console.log(lesson.RED[Object.keys(lesson.RED)[j]] +' '+ lesson.BLUE[Object.keys(lesson.BLUE)[j]]);
                            if(lesson.RED[Object.keys(lesson.RED)[j]] != lesson.BLUE[Object.keys(lesson.BLUE)[j]]){
                                colorsIsSimilar = false;
                                break
                            }
                        }

                        if(colorsIsSimilar){
                            delete lesson.BLUE;
                            temp = {...lesson.RED};
                            delete lesson.RED;

                            lesson = Object.assign(lesson, temp)
                        }
                    }
                    
                    if(lesson.RED || lesson.BLUE || (lesson.title && (lesson.place || lesson.aud))) week[weekKeys[i]].push(lesson);
                }
            }
        }
        sheets.spreadsheets.values.get(properties, (err, res) => {
            if (err) console.log(err);
            else processFunc(res.data.values);
        })
    }

    getLessons('groupes');
})()