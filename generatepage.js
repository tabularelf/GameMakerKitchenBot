const { client } = require("./index.js");
const DESTINATED_CHANNEL = '1179825156680601630';
const YAML = require('yaml');
const fs = require('node:fs');
const { Octokit } = require("@octokit/rest");
const { githubToken } = require('./config.json');
const { Base64 } = require('js-base64');
const Path = require("path");
const octokit = new Octokit({ auth: githubToken });
const repoPath = '../GameMakerKitchen-Website'
const crypto = require('crypto');
const charWhitelist = /[^\w\s]/gi;


module.exports = {
    GeneratePageFromText: async function (thread, firstMessage) {
        if (thread.parentId == DESTINATED_CHANNEL) {
            if (firstMessage != undefined) {
                //console.log(firstMessage.content);
                let contents = firstMessage.content;
                let link, docs, tags, authors, description;
                authors = undefined;
                let linkPos = contents.to-LowerCase().indexOf('!link');
                let docsPos = contents.toLowerCase().indexOf('!docs');
                let tagsPos = contents.toLowerCase().indexOf('!tags');
                let authorsPos = contents.toLowerCase().indexOf('!authors');
                let descriptionPos = contents.toLowerCase().indexOf('!description');

                if (linkPos != -1) {
                    link = contents.slice(linkPos).replace('!link ', '').split(/\r?\n/)[0];
                } else {
                    linkPos = Infinity;
                    link = undefined;
                }

                if (descriptionPos != -1) {
                    description = contents.slice(descriptionPos).replace('!description ', '').split(/\r?\n/)[0];
                } else {
                    descriptionPos = Infinity;
                    description = undefined;
                }

                if (docsPos != -1) {
                    docs = contents.slice(docsPos).replace('!docs ', '').split(/\r?\n/)[0];
                } else {
                    docsPos = Infinity;
                    docs = undefined;
                }

                if (tagsPos != -1) {
                    tags = contents.slice(tagsPos).replace('!tags ', '').split(/\r?\n/)[0].replaceAll(' ', '').split(',');
                } else {
                    tagsPos = Infinity;
                    tags = undefined;
                }

                if (authorsPos != -1) {
                    authors = contents.slice(authorsPos).replace('!authors ', '').split(/\r?\n/)[0].replaceAll(' ', '').split(',');
                } else {
                    authorsPos = Infinity;
                }

                if (linkPos === Infinity || tagsPos === Infinity) {
                    let channel = await client.channels.cache.get(thread.id);
                    await channel.send('The forum post did not follow the specified layout. Please use `/generate-page-resource` to generate a page!');
                    return;
                }

                if (authors != undefined) {
                    let newAuthors = [];
                    for (author in authors) {
                        let authorInfo = undefined;
                        if (authors[author].includes('<@') == false || authors[author].includes('>') == false) {
                            newAuthors.push(authors[author]);
                            continue;
                        }
                        try {
                            authorInfo = await client.users.fetch(authors[author].replace("<@", '').replace(">", ''));
                        } catch (error) {
                            console.log(error);
                        }

                        if (authorInfo == undefined) {
                            continue;
                        }

                        newAuthors.push(authorInfo.username.replaceAll(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase());
                    }

                    authors = newAuthors;
                    authors.splice(0, 0, firstMessage.author.username);
                } else {
                    authors = [firstMessage.author.username];
                }

                let threadTags = await thread.parent.availableTags.filter(tag => thread.appliedTags.includes(tag.id)).map(tag => tag.name.toLowerCase());
                let threadLink = `https://discord.com/channels/${thread.guildId}/${thread.id}`;


                let date = GenerateDate(firstMessage.createdTimestamp);

                let paid = false;
                if (threadTags.includes('paid')) {
                    paid = true;
                }

                let type = undefined;
                if (threadTags.includes('library')) {
                    type = 'lib';
                }

                if (threadTags.includes('tool')) {
                    type = 'tool';
                }

                if (threadTags.includes('asset')) {
                    type = 'asset';
                }

                if (threadTags.includes('tutorial')) {
                    type = 'tutorial';
                }

                if (threadTags.includes('snippet')) {
                    type = 'snippet';
                }

                type ??= 'asset';


                let endPos = Math.min(contents.length, linkPos, authorsPos, descriptionPos, tagsPos, docsPos);
                if (endPos > -1) {
                    contents = contents.slice(0, endPos - 1);
                }

                let resourceData = {
                    title: thread.name,
                    link: link,
                    docs: docs,
                    date: date,
                    threadLink: threadLink,
                    paid: paid,
                    description: description,
                    tags: tags,
                    authors: authors,
                }

                GenerateYAML(resourceData, contents);
            } else {
                console.log(`The message ${firstMessage} is not the type message!`);
            }
        }
    },
    GeneratePageFromCommand: async function (data) {
        let date = GenerateDate(data.firstMessage.createdTimestamp);
        let newAuthors = [];
        let authors = data.authors.split(',');
        for (author in authors) {
            let authorInfo = undefined;
            if (authors[author].includes('<@') == false || authors[author].includes('>') == false) {
                newAuthors.push(authors[author]);
                continue;
            }
            try {
                authorInfo = await client.users.fetch(authors[author].replace("<@", '').replace(">", ''));
            } catch (error) {
                console.log('Not a valid user!');
            }
            if (authorInfo == undefined) {
                continue;
            }
            newAuthors.push(authorInfo.username.replaceAll(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, ''));
        }
        authors = newAuthors;


        let resourceData = {
            title: data.title,
            link: data.link,
            description: data.description,
            threadLink: `https://discord.com/channels/${data.thread.guildId}/${data.thread.id}`,
            docs: data.docs,
            paid: data.paid,
            date: date,
            tags: data.tags.split(',').map(str => str.trim()),
            authors: newAuthors.map(str => str.trim()),
        }

        return GenerateYAML(resourceData, data.firstMessage.content, data.type);
    }
}

const GenerateYAML = async function (resourceData, contents, type) {
    let str = "---\n" + YAML.stringify(resourceData) + "---" + "\n" + contents;
    try {
        fs.mkdirSync(`src/${type}s/${resourceData.authors[0]}`, {recursive: true});
    } catch (err) {
        console.error(err);
    }

    fs.writeFileSync(`src/${type}s/${resourceData.authors[0].replace(charWhitelist, '').trim()}/${resourceData.title}.md`, str, err => {
        if (err) {
            console.log(err);
        }
    });

    return CreatePR(resourceData, type, str)
}

const CreatePR = async function(data, type, content) {
    const repoName = 'GameMaker-Kitchen';
    const owner = 'tabularelf';

    var pathType = type;
    switch(type) {
        case 'library': pathType = 'librarie'; break;
    }

    var path = `src/${pathType}s/${data.authors[0]}/${data.title}.md`;
    console.log(data);
    console.log(path);
    console.log("Creating file");
    let stats = fs.statSync(path);
    let sha = crypto.createHash('sha1').update("blob " + String(stats.size) + '\x00' + fs.readFileSync(path)).digest('hex');
    console.log(`SHA1: ${sha}\nSize: ${stats.size}\nContents: ${fs.readFileSync(path)}`);

    await octokit.rest.repos.createOrUpdateFileContents({
        owner: owner,
        repo: repoName,
        path: path,
        message: `Submission Automated.`,
        content: Base64.encode(content),
        sha: sha,
        'committer.name': 'GameMakerKitchen-Bot',
        'committer.email': 'tabularelf@gmail.com',
        'branch': 'botprbranch',
    });

    console.log("Creating PR");
    try {
        octokit.pulls.create({
            repo: repoName,
            owner: owner,
            title: `Submission: ${data.title}`,
            head: 'tabularelf:botprbranch',
            base: "master",
            body: `Automation: Submission ${data.title}`,
            maintainer_can_modify: true,
        });
    } catch(error) {
        console.log("attempted to do a double PR. Possibly has already being created!");
        console.log(error);
    }

    // I'd return something, but it turns out that there's nothing I can return?
    // TODO: Fix this shit
    return;
}

const GenerateDate = function (timestamp) {
    let date = new Date(timestamp);
    let day = String(date.getUTCDate());
    let month = String(date.getMonth()+1);
    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());
    let seconds = String(date.getSeconds());
    day = day.length == 1 ? "0" + day : day;
    month = month.length == 1 ? "0" + month : month;
    hours = hours.length == 1 ? "0" + hours : hours;
    minutes = minutes.length == 1 ? "0" + minutes : minutes;
    seconds = seconds.length == 1 ? "0" + seconds : seconds;
    date = `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`
    return date;
}