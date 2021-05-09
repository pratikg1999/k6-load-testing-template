Script to get minute-wise metrics (duration, error/success rate, requests) during a load test

## Prerequisites (any one of the following)-
* k6 sdk + influxDB + grafana 
* docker

## Basic run
* Update the [script](./script.js) according to your need.
* To run it locally type
```
k6 run script.js --console-output=./consoleLogs.log
```

## Results visualization using grafana (on docker)
* Start influxdb and grafana containers
    ```
    docker-compose up -d \
    influxdb \
    grafana
    ```
* Start k6 test
    * If you have k6 installed locally (Recommended)-
    ```
    k6 run script.js --console-output=./consoleLogs.log --out influxdb=http://localhost:8086/k6
    ```
    * You can run the k6 docker container. *Note that you won't be able to get any __summary__ and outputs*
    ```
    docker-compose run -v \
    $PWD:/scripts \
    k6 run /scripts/script.js
    ```

*__Note__: See [sample result](./sampleResult.json) for a sample of summary output*