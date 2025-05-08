module.exports = async function(match, type) {
    const formatIndent = function(str)  {
        const lines = str.replace(/\t/g, "    ").split("\n"); // replaces tabs with 4 spaces
        const ignored = []; // list of blank lines
        let minSpaces = Infinity; // the smallest amount of spaces in any line
        const newLines = []; // array of the returned lines
        lines.forEach((line, idx) => {
          const leadingSpaces = line.search(/\S/);
          if (leadingSpaces === -1) {
            ignored.push(idx);
          } else if (leadingSpaces < minSpaces) {
            minSpaces = leadingSpaces;
          }
        });
    
        lines.forEach((line, idx) => {
          if (ignored.includes(idx)) {
            newLines.push(line);
          } else {
            newLines.push(line.substring(minSpaces));
          }
        });
    
        return newLines.join("\n");
    };
    const fetch = require("node-fetch");
    let lines;
    let filename = match[3];
    let url;
    let typeLowered = type.toLowerCase();
    if (typeLowered == "github") {
        console.log("Github accessed!");
        url = `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${filename}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            console.log("Nulled!");
            return null; // TODO: fallback to API
        }
        const text = await resp.text();
        lines = text.split("\n");
    } else if (typeLowered == "gitlab") {
        const resp = await fetch(`https://gitlab.com/${match[1]}/-/raw/${match[2]}/${filename}`);
        if (!resp.ok) {
          return null; // TODO: fallback to API
        }
        const text = await resp.text();
        lines = text.split("\n");
    } else if (typeLowered == "gist") {
        const dotFilename = filename.replace(/-([^-]*)$/, ".$1");
        let text;
        if (match[2].length) {
            const resp = await fetch(`https://gist.githubusercontent.com/${match[1]}/raw/${match[2]}/${dotFilename}`);
            if (!resp.ok) {
                return null; // TODO: fallback to API
            }
            text = await resp.text();
            } else {
                const resp = await fetch(`https://api.github.com/gists/${match[1].split("/")[1]}`, {
                method: "GET",
                headers: this.authHeaders
            });
            if (!resp.ok) {
                return null;
            }
            const json = (await resp.json());     
            // Making Typescript happy (the json being unexpected is highly unlikely)
            if (!("files" in json) || !json.files) {
            console.log("The JSON returned by the API was not as expected!");
                return null;
            }
            text =
                json.files[dotFilename]?.content ||
                json.files[
                Object.keys(json.files).find((key) => key.toLowerCase().replace(/\W+/g, "-") === filename.toLowerCase()) ||
                    ""
                ]?.content; // this madness allows for matching filenames with weird char           
            if (!text) {
                // if the gist exists but not the file
                return null;
            }
        }
        filename = dotFilename;
        lines = text.split("\n");  
    }


    let toDisplay;
    let lineLength;
    if (!match[5].length || match[4] === match[5]) {
      if (parseInt(match[4], 10) > lines.length || parseInt(match[4], 10) === 0) return null;
      toDisplay = lines[parseInt(match[4], 10) - 1].trim().replace(/``/g, "`\u200b`"); // escape backticks
      lineLength = 1;
    } else {
      let start = parseInt(match[4], 10);
      let end = parseInt(match[5], 10);
      if (end < start) [start, end] = [end, start];
      if (end > lines.length) end = lines.length;
      if (start === 0) start = 1;
      lineLength = end - start + 1;
      toDisplay = formatIndent(lines.slice(start - 1, end).join("\n")).replace(/``/g, "`\u200b`"); // escape backticks
    }

    // file extension for syntax highlighting
    let extension = (filename.includes(".") ? filename.split(".") : [""]).pop(); // .pop returns the last element
    if (!extension || extension.match(/[^0-9a-z]/i)) extension = ""; // alphanumeric extensions only

    return {
        lineLength,
        extension,
        toDisplay,
    };
}