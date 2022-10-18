const express = require('express')
const fetch = require('node-fetch');
const app = express()
const port = 3000

const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'benchmark'
    }
});

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
    for (i = 0; i < 100; i++) {
        const name = await generateName(),
            dob = new Date().toISOString().slice(0, 10);

        const person_id = await knex('person').insert({ name, dob })
        await knex('account').insert({ person_id: person_id, email: `${randomStr()}@gmail.com`, password: randomStr() })
    }
    await knex('person')
        .join('account', 'person.id', '=', 'account.person_id')
        .select()
    await knex('account').del()
    await knex('person').del()
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})