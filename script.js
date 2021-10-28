import http from 'k6/http';
import { randomIntBetween, uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";
import { sleep } from 'k6';

export const options = {
    scenarios: {
      constant_request_rate: {
        executor: 'constant-arrival-rate',
        rate: 10000,
        timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
        duration: '5m',
        preAllocatedVUs: 10000, // how large the initial pool of VUs would be
        // maxVUs: 200, // if the preAllocatedVUs are not enough, we can initialize more
      },
    },
  };

export default function () {
    const url = 'http://192.168.11.80/iot-server.php'; // make sure this is not production
    // const url = 'http://test.k6.io/login';
    const payload = JSON.stringify({
        "identifier": uuidv4(),
        "value": randomIntBetween(0,100000),
        "date": new Date().toISOString().slice(0, 19).replace('T', ' ')
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    http.post(url, payload, params);
}