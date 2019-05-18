# EnergySaver


This project was developed with help from the Department of Energy under the virtual student federal service, these are the code files for energy saver dialogflow application, using the dialogflow API for NodeJS. This functions as the server component of the system while a dialogflow agent serves as the client.

To install all the required packages please use ```npm install``` when using a unix terminal like bash, this will install all the necessary components from npm.



### Adding Intents

To add an intent create a new intent handler as referenced in the dialogflow documentation. An intent is of the format

````javascript
app.intent(INTENT_NAME, function(conv, params) {
    // intent code goes here
});
````

The conv object contains the state of the conversation as well as all specific details about the current conversation, and params contains parameters passed down as a context object.

For security reasons I removed my API keys and they would have to be replaced by API keys for Energy Star and NREL energy cost database.

### Adding Appliances

New appliances can be added by adding to the appliance URLs object, and modifying the dialogflow agent to handle them, and also modifying the enter_model intent to parse the new format that is returned if using a different service than energy star.

```python
const applianceUrls = {
    dryer: 'https://data.energystar.gov/resource/t9u7-4d2j.json',
    washer: 'https://data.energystar.gov/resource/bghd-e2wd.json',
    dishwasher: 'https://data.energystar.gov/resource/58b3-559d.json',
    refrigerator: 'https://data.energystar.gov/resource/p5st-her9.json',
    freezer: 'https://data.energystar.gov/resource/8t9c-g3tn.json',
    newApplianceName: 'url to data about appliance'
};
```



### Problems

The agent still has problems with the google assistant front end, and will occasionally crash when using it. I couldn't find any solutions that I could implement in a short amount of time, short of a full rewrite using an XML generator, to generate the response files required by the HTTP api of dialogflow.

The part where the server tries to request energy cost information from the NREL database doesn't work entirely, I didn't have enough time to add all of it with school and trying to fix the previous problem with google assistant.



### Useful Links

https://developers.google.com/actions/reference/nodejsv2/overview
