const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('c:/Users/ajha2/Desktop/solar/client/src/**/*.{js,jsx}');
const apiFilesMap = [
    'approvalsApi', 'brandApi', 'disputeApi', 
    'loanApi', 'locationApi', 'masterApi', 
    'organizationApi', 'projectService', 'ticketApi'
];
let counts = {};
apiFilesMap.forEach(api => counts[api] = 0);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    apiFilesMap.forEach(api => {
        if (content.includes('services/' + api)) {
            counts[api]++;
        }
    });
});
console.log(counts);
