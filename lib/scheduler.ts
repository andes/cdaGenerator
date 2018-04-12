let schedule = require('node-schedule');
import * as ConfigPrivate from '../lib/config.private';

class Scheduler {

    static initialize() {

        /**
         *
         * Cada tarea tiene que exportar una función que se ejecuta
         * cuando se da el tiempo indicado
         *
         */

        ConfigPrivate.jobs.forEach(job => {
            let action = require(job.action);
            schedule.scheduleJob(job.when, function () {
                action();
            });
        });

    }

}

Scheduler.initialize();