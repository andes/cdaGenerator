let path = require('path');
let fs = require('fs');

export class QueryBuilder {
    constructor() {}

    public from(efector) {
        try {
            let e = efector;
            let q = fs.readFileSync(path.dirname(fs.realpathSync(__filename)) + '/queries/' + e + '.txt').toString();
            return q;
        } catch (ex) {
            console.log('Error:', ex);
        }
    }
}