# APL Lazy Loading Lists Demo

## What You Will Need
*  [Amazon Developer Account](http://developer.amazon.com/alexa)
*  The sample code on [GitHub](https://github.com/alexa-samples/apl-lazy-load-lists-demo).

## Setting Up the Demo
If you use Alexa hosted, follow the steps:

1. Create a new Alexa Hosted skill using Node.js
2. Copy paste the file models/en-US.json into the json editor of the interaction model. 
3. Enable Alexa Presentation Language under Interfaces. 
4. Build your interaction model and skill changes.
5. Go to the *Code* tab. Copy paste the index.js into the index.js file already in your hosted environment. (SkillCode > lambda > index.js)
6. Create a new file for each of the json documents in the *Code* tab and copy the code repo's files into your new file. You must do this with "colors.json", "pagerDocument.json", and "sequenceDocument.json". You can exclude "SampleData.json". This is only for using the [APL authoring tool](https://developer.amazon.com/alexa/console/ask/displays). 
7. Deploy and enjoy!

## Running the Demo
To start the demo say/type "alexa open color picker". It will present the APL document on the device if you are using an APL compatible device, such as the Echo Show. Otherwise, you will be asked to run the skill on a compatible device. This demo does require at least APL version 1.3. 

### Demo Features

The demo will allow a very large set of items (colors) to be displayed inside of a pager or a sequence component. You can change the component being used in the document by selecting *pager* or *sequence* in the header. As you scroll, more items will be loaded in. This is handled in the lambda code through the use of the new directive, [Alexa.Presentation.APL.SendIndexListData](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-interface.html#sendindexlistdata-directive) as a part of the handler, `LoadIndexListDataRequestHandler`. 

This demo also shows an example APL error handler, `APLRuntimeErrorHandler`. This handles the new request type, [Alexa.Presentation.APL.RuntimeError](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-interface.html#runtimeerror-request).

Check out the build directory README if you want to modify the colors list or just want to see the code/instructions on how the interaction model was created. 

Explore the demo and feel free to use this as a base to try out handling your own data sources. Open a Github issue if you find any problems. 
