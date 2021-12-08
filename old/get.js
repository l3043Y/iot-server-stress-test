import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween, uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";
// import { sleep } from 'k6';
const users = 15000;
export const options = {
    noConnectionReuse: false,
    noCookiesReset: true,
    noVUConnectionReuse: false,
    scenarios: {
      constant_request_rate: {
        executor: 'constant-arrival-rate',
        rate: users,
        timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
        duration: '3m',
        preAllocatedVUs: users, // how large the initial pool of VUs would be
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
        // timeout: 1000000
    };

    const res = http.post(url, payload, params);
    check(res, {
        'is status 200': (r) => r.status === 200,
        'record is saved': (r) =>
            r.body && r.body.includes('Records added successfully!!'),
    });
}