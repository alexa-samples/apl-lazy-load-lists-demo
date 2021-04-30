# Build the tmp files

This build directory is to show the interaction model build process from the data. You will need node installed locally. You only need to read this if you are modifying the colors.json file in the lambda directory and want to rebuild the project.

## Building steps

The initial data source is in the lambda file, colors.json. If you want to add additional colors, follow the steps below to update your code and interaction model:

1. Add the colors to the ../lambda/colors.json file. The important fields are name and value. Value must be a hex representation of the color (with pound sign). Index will be regenerated.
2. Run `node index.js` from this directory. This will produce two files, colors.json.tmp and interactionModelColors.json.tmp
3. Replace the line in the interaction model (../models/en-US.json) representing the Color type with the contents of this file. This is in the "types" array.
4. Replace the contents of your color.json with the contents of color.json.tmp. This will account for movement and insertion of colors in the initial file. The index field is needed by the code but not for the build which is why you could omit it before. 
5. In the console, deploy your new color.json, build your new interaction model, and test!
