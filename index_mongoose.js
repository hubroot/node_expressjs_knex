const express = require('express')
const fetch = require('node-fetch');
const app = express()
const port = 3000

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/test');

const PersonSchema = new mongoose.Schema({
    name: String,
    dob: Date
});
var Person = mongoose.model('Person', PersonSchema);

const AccountSchema = new mongoose.Schema({
    person_id: String,
    name: String,
    password: String,
    created_at: Date
});
var Account = mongoose.model('Account', AccountSchema);

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    } catch (error) {
        console.error('Unable to fetch data:', error);
    }
}

function fetchNames(nameType) {
    return fetchData(`https://www.randomlists.com/data/names-${nameType}.json`);
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

async function generateName(gender) {
    try {
        // Fetch both name lists in parallel
        const response = await fetchNames(pickRandom(['male', 'female']))
        return pickRandom(response.data);
    } catch (error) {
        console.error('Unable to generate name:', error);
    }
}

function randomStr() {
    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var string = '';
    for (var ii = 0; ii < 15; ii++) {
        string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string;
}

app.get('/', async (req, res) => {
    for (i = 0; i < 50; i++) {
        const name = await generateName(),
        dob = new Date().toISOString().slice(0, 10);

        const person = await Person.create({ name, dob });
        await Account.create({ person_id: person._id, email: `${randomStr()}@gmail.com`, password: randomStr() })
    }

    Person.find({}).then(function (p) {
        p.name = randomStr();
    });
    Account.find({}).then(function (p) {
        p.email = randomStr();
    });

    await Account.remove({})
    await Person.remove({})
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})