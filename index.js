'use strict';

// require('dotenv').config();
var Airtable = require('airtable')
const ALLOWED_BASES = ['app0ZJgZxm6LC8rBB', 'appNtmri6lpYTOimo'] // CR Stories
const ALLOWED_TABLES = {
    app0ZJgZxm6LC8rBB : ['Stories', 'Subjects', 'Lessons', 'Lesson Subjects'],
    appNtmri6lpYTOimo : ['Teams', 'Games']
}

// var fs = require('fs');
 
// var contents = fs.readFileSync('DATA', 'utf8');
console.log(`__dirname ${__dirname}`);

// console.log('after calling readFile');

// console.log(process.env);
// console.log(`\nAIRTABLE_KEY: ${process.env.AIRTABLE_KEY}`);


Airtable.configure({ apiKey: 'keyKL1QIgxY04B2PB' })

exports.handler = function(event, context, callback) {
    
    if (event.body) {
        event = JSON.parse(event.body);
    }

    if (!ALLOWED_BASES.includes(event.baseId)) {
        let response = createErrorResponse(403, "You may not query that base.")
        callback(null, response);
        return;
    }
    
    if (!ALLOWED_TABLES[event.baseId].includes(event.tableName)) {
        let response = createErrorResponse(403, "You may not query that table.")
        callback(null, response);
        return;
    }
    
    var base = new Airtable().base(event.baseId);
    var table = base.table(event.tableName)
    console.log('eggs!')

    switch(event.action) {
        case "select":
            table.select().firstPage().then(records => { 
                console.log(`${records.length} records returned.`)
                console.log(records)
                let body = []
                records.forEach( element => {
                    element.fields.id = element.id
                    body.push(element.fields)
                })
                let response = createResponse(200, body)
                callback(null, response)
            })
            break;
        case "find":
            table.find(event.recordId).then(record => {
                console.log(record)
                let response = createResponse(200, record.fields)
                callback(null, response)
            })
            break;
        default:
            let response = createErrorResponse(400, "Must specify an 'action' of 'select' or 'find'.")
            callback(null, response);
            break;
    }
    return
};

function createResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: { 
            "Content-type": "application/json", 
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify( body )
    }
}

function createErrorResponse(statusCode, message) {
    let body = { "error" : message }
    return createResponse(statusCode, body)
}