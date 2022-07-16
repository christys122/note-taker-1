const fs = require('fs');
const path = require('path');

const express = require('express');
const { notes } = require('./Develop/db/db.json');
const PORT = process.env.PORT || 3001;
const app = express();

//parse incoming string or array data
app.use(express.urlencoded({ extended: true }));


app.use(express.json());
//parse incoming JSON data

app.use(express.static('public'));

function filterByQuery(query, notesArray) {

    let titleArray = [];
    let filteredResults = notesArray;
    if (query.title) {
        if (typeof query.title === 'string') {
            titleArray = [query.title];
        } else {
            titleArray = query.title;
        }
        titleArray.forEach(noteTitle => {
            filteredResults = filteredResults.filter(
                note => note.title.indexOf(noteTitle) !== -1
            );
        });
    }

    return filteredResults;
}

function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result;
}

function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './Develop/db/notes.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );
    return note;
}

function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    return true;
}


app.get('/api/db', (req, res) => {
    let results = notes;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/db/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

app.post('/api/db', (req, res) => {
    //req body is incoming content length sets id to add 1 number to existing
    req.body.id = notes.length.toString();
    //add note to json file and notesArray
    if (!validateNote(req.body)) {
        res.status(400).send('The note must be text only');
    } else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/db', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

// module.exports = {
//     filterByQuery,
//     findById,
//     createNewNote,
//     validateNote
// };