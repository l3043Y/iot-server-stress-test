import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween, uuidv4 } from "./index.js";
// This will export to HTML as filename "result.html" AND also stdout using the text summary
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
 
// import { sleep } from 'k6';
const users = 10000;
let folder = './html_report';
try{
  if(!open(folder+'/.k6')) {
  }
} catch(e) {
  throw `folder not exist! mkdir ${folder.slice(2)} touch ${folder}/.k6`
}

export const options = {
    noConnectionReuse: false,
    noCookiesReset: true,
    noVUConnectionReuse: false,
    scenarios: {
      constant_request_rate: {
        executor: 'constant-arrival-rate',
        rate: users,
        timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
        duration: '2m',
        preAllocatedVUs: users, // how large the initial pool of VUs would be
        // maxVUs: Math.floor(2*users), // if the preAllocatedVUs are not enough, we can initialize more
      },
    },
  };

export default function () {
    const url = 'http://192.168.11.75/iot-server.php'; // make sure this is not production
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
function replaceAll(str, match, replacement){
  return str.split(match).join(replacement);
}

export function handleSummary(data) {
  const d = new Date()
  const date = replaceAll(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString(),"-", "")
  const name = '/'+replaceAll(date,":", "")
  
  return {
    [folder+name+'.html']: htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
