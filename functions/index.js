const functions = require('firebase-functions');
const request = require('request-promise');
// key for energy star
const token = '';
// key for energy cost
const nrel_key = '';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const {dialogflow} = require('actions-on-google');
const app = dialogflow({debug: true});

exports.energySaver = functions.https.onRequest(app);


const applianceUrls = {
    dryer: 'https://data.energystar.gov/resource/t9u7-4d2j.json',
    washer: 'https://data.energystar.gov/resource/bghd-e2wd.json',
    dishwasher: 'https://data.energystar.gov/resource/58b3-559d.json',
    refrigerator: 'https://data.energystar.gov/resource/p5st-her9.json',
    freezer: 'https://data.energystar.gov/resource/8t9c-g3tn.json'
};

// Appliance usage intent
app.intent('energysaver.appliance_usage', (conv, params) => {
    const context = conv.contexts.get('appliance_usage');
    context.parameters.appliance = params.appliance.toLowerCase();
    if(!(context.parameters.appliance in applianceUrls)) {
        conv.close("Sorry that is not a supported appliance, please try again.");
    }
});

// Intent for enter brand name
app.intent('energysaver.enter_brand_name', (conv, params) => {
    const context = conv.contexts.get('appliance_usage');
    context.parameters.brand_name = params.brand_name;
});

// Intent for user to enter model number
app.intent('energysaver.enter_model', (conv, params) => {
    const context = conv.contexts.get('appliance_usage');
    console.log(`Params: (${context.parameters.appliance},
         ${context.parameters.brand_name}, ${params.model_number})`);
    const config = {
        method: 'GET',
        uri: applianceUrls[context.parameters.appliance] +
         `?model_number=${params.model_number}&brand_name=${context.parameters.brand_name}`,
        json: true,
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'request',
            'X-App-Token': token
        }
    };

    // Requests from API and then expects data return in json format
    return request(config).then((body) => {
        if(body) {
            console.log(body);
            const data = body[0];
            if(data.hasOwnProperty('annual_energy_use_kwh_year')) {
                context.parameters.annual_energy_use = parseFloat(data.annual_energy_use_kwh_year);
                conv.ask(`This appliance's estimated annual energy usage is ${data.annual_energy_use_kwh_year}
                      kilowatts per hour, based upon Energy Star's estimated annual usage. Would you like to know this appliance's
                      annual cost based upon local energy costs?`);
            }
            else if(data.hasOwnProperty('annual_energy_use_kwh_yr')) {
                context.parameters.annual_energy_use = parseFloat(data.annual_energy_use_kwh_yr);
                conv.ask(`This appliance's estimated annual energy usage is ${data.annual_energy_use_kwh_year}
                      kilowatts per hour, based upon Energy Star's estimated annual usage. Would you like to know this appliance's
                      annual cost based upon local energy costs?`);
            }
            else {
                conv.close("No energy usage found for this product.");
            }
        }
    }).catch((err) => {
        console.error(err);
        conv.close("Sorry that information could not be found, maybe you entered wrong information.");
    });
});


// Enter model and also location, still buggy
app.intent('energysaver.enter_model - yes - enter_location', (conv, params) => {
    const context = conv.contexts.get('appliance_usage');
    const zip = params['zip-code'];
    const url = `https://developer.nrel.gov/api/utility_rates/v3.json?address=${zip}&api_key=${nrel_key}`;
    return request.get(url).then((body) => {
        if(body) {
            try {
                const obj = JSON.parse(body);
                console.log(context.parameters.annual_energy_use);
                const price = parseFloat(obj.outputs.residential);
                const usage = parseFloat(context.parameters.annual_energy_use);
                console.log(price);
                const cost = price * usage;
                conv.close(`At an annual energy cost of $${price} per kilowatt hour.
                            Your annual cost for the ${context.parameters.appliance} will be $${cost}.`);
            }
            catch(err) {
                console.error(err);
            }
        }
    }).catch((err) => {
        console.error(err);
        conv.close("Sorry that information could not be found, maybe you entered wrong information.");
    });
});

// Error handler
app.catch((conv, e) => {
    console.error(e);
    conv.close("Something went wrong.");
});
