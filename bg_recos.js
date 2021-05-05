var fs = require('fs');

var data = fs.readFileSync('members.csv')
    .toString() // convert Buffer to string
    .split('\n') // split string to lines
    .map(e => e.replace(/['"]+/g, '')) // remove white spaces for each line

const ML_BG_URL =
    'http://a76081e992b4f11ea950206b04313c04-722684964.us-west-2.elb.amazonaws.com';
const MS_REF_URL = 'http://recommendation.ssense.com/api/product';

const ID = 7113321;
const gender = 0; // 0 = W, 1 = M, 2 = EE;
const NUMBER_OF_RECOS = 30;

const fetch = require("node-fetch"); // may need npm install node-fetch

async function getRecommendations(id) {
    const url =`${ML_BG_URL}/predict?memberId=${id}`;
    console.log(url);
    const response = await fetch(url);
    if (response.ok) {
        const json = await response.json();
        return json.predictions
    } else {
        // eslint-disable-next-line no-console
        console.log(id)
        console.log(response.status);
    }
}

async function getBrandNames(ids) {
    const url = `${MS_REF_URL}/brands?ids=${arrayToString(ids)}&language=en`;
    console.log(url);
    const response = await fetch(url);
    if (response.ok) {
        return (await response.json()).map((brand) => brand.seo_keyword.en);
    } else {
        console.log(response.status);
    }
}

const arrayToString = (ids) => {
    return ids.join(',');
};

let results = {};
const LAST_IDX = 10
const prom = new Promise((resolve, reject) => {
    data.slice(1, LAST_IDX + 1).forEach((id, idx) => {
        getRecommendations(id)
            .then((predictions) => {
                results[id] = predictions;
                if(LAST_IDX === idx){
                    resolve();
                }
            })
            .catch((e) => {
                console.log(e);
            });
    })
});

prom.then(() => {
    console.log(JSON.stringify(results))
    console.log(Object.keys(results).length)
})

