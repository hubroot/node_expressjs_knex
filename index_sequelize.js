const express = require('express')
const fetch = require('node-fetch');
const app = express()
const port = 3000

const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('benchmark', 'root', 'root', {
    dialect: 'mysql',

    logging: false
})

class Person extends Model { }
Person.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dob: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: false,
    modelName: 'person'
});

class Account extends Model { }
Account.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    freezeTableName: true,
    timestamps: false,
    modelName: 'account'
});
Person.hasOne(Account, { foreignKey: 'person_id' });

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

        const person = await Person.create({ name, dob });
        await person.createAccount({ email: `${randomStr()}@gmail.com`, password: randomStr() })
    }
    await Person.findAll({
        include: [{
            model: Account
        }]
    })
    await Account.destroy({ where: {} })
    await Person.destroy({ where: {} })
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})