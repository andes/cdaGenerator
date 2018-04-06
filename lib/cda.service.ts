import * as http from 'http';
import {
    ConfigPrivate
} from './config.private';


declare const Promise;

export class CdaBuilder {
    build(data: any) {
        return new Promise((resolve: any, reject: any) => {
            let options = {
                host: ConfigPrivate.network.host,
                port: ConfigPrivate.network.port,
                Authentication: ConfigPrivate.secret.token,
                path: ConfigPrivate.URL.cda + '/',
                method: 'POST',
                headers: {
                    'Authorization': ConfigPrivate.secret.token,
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function (res) {
            res.on('data', function (body) {

                resolve(body.toString());
            });
            });
            req.on('error', function (e) {
                console.log('Problemas API al crear CDA : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
            /*write data to request body*/

            req.write(JSON.stringify(data));
            req.end();
        });
    };
}