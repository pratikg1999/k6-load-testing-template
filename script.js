// Script to get minute-wise metrics (duration, error/success rate, requests) during a load test
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// Constants - change it according to your need
const TEST_SUMMARY_FILENAME = "summary.json" // relative path in which the test summary will be save in JSON format 
const VUS = 10
const DURATION = '10s' // Duration of the test in `hms` (hour, minute, seconds) format

let durTrend = new Trend('durTrend');
let errorRate = new Rate('errorRate');
let successRate = new Rate('successRate');
let reqCounter = new Counter('reqCounter');
const startTime = new Date();

export const options = {
  vus: VUS,
  duration: DURATION,
  // iterations: 10,
  thresholds: {
  }
}
// Dummy thresholds - necessary to include minute-wise details (tags) in the metrics
for (let i = 0; i < 10; ++i) {
  options.thresholds[`durTrend{interval:${i}}`] = ['max>=0'];
  options.thresholds[`errorRate{interval:${i}}`] = ['rate>=0'];
  options.thresholds[`successRate{interval:${i}}`] = ['rate>=0'];
  options.thresholds[`reqCounter{interval:${i}}`] = ['count>=0'];
}

export default function () {
  // Run with script with --console-output args to pipe console logs to a file
  // console.log("running", __VU); // print the number of virtual users
  // console.log("cur iteration", __ITER); // print the current iteration number
  let res = http.get('https://www.google.com');
  reqCounter.add(1, { 'interval': Math.floor(((new Date()) - startTime) / 60000).toString() });
  errorRate.add(res.error_code, { 'interval': Math.floor(((new Date()) - startTime) / 60000).toString() });
  successRate.add(!res.error_code, { 'interval': Math.floor(((new Date()) - startTime) / 60000).toString() });
  group("success checks", () => {
    check(res, {
      "response code was 200": (res) => res.status == 200,
    });
  })
  if (res.status == 200) {
    durTrend.add(res.timings.duration, { 'interval': Math.floor(((new Date()) - startTime) / 60000).toString() })
  }
  sleep(1);
}

export function handleSummary(data) {
  return {
    [TEST_SUMMARY_FILENAME]: JSON.stringify(data),
  }
}
