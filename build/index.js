const fs = require('fs');
const colors = require('../lambda/colors.json');

let interactionModelColorsType = {
    name: "Colors",
    values: [
        
    ]
};
let map = {};
let list = [];
let index = 0;

try {
    colors.forEach(element => {
        let hexValue = element.value;
        let name = element.name;
        let realHex = hexValue.replace(/[^\w\s#]/gi, '');
        const valueIndex = map[String(realHex)];

        if(map[String(realHex)] && valueIndex && interactionModelColorsType.values[valueIndex]) {
            //Duplicate detected
            if(interactionModelColorsType.values[valueIndex].synonyms) {
                interactionModelColorsType.values[valueIndex].synonyms.push(sanitize(name));
            } else {
                interactionModelColorsType.values[valueIndex]["synonyms"] = [sanitize(name)];
            }
        } else {
            if(map[String(realHex)]){
                console.log("map value index: " + map[String(realHex)]);
                console.log("failed value: " + name);
                list.push({"name":sanitize(name), "value":realHex, "index": index});
            } else {
                map[String(realHex)] = index;
                list.push({"name":sanitize(name), "value":realHex, "index": index});
                interactionModelColorsType.values.push({
                    name: {
                        value: sanitize(name)
                    },
                    id: index
                });
            }
            index++;
        }
    });

    fs.writeFile('interactionModelColors.json.tmp', JSON.stringify(interactionModelColorsType), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    fs.writeFile('colors.json.tmp', JSON.stringify(list), function (err) {
        if (err) {
            return console.log(err);
        }
    });
} catch (e) {
    console.error('Error:', e.stack);
}

function sanitize(name) {
    const replaced = name.replace(/'/g, "");
    return replaced;
}