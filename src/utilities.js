const fetch = require('node-fetch'); 
const http = require('http');
const fs = require('node:fs');
const download = async function (url, dest, cb) {
	var file = fs.createWriteStream(dest);
	var request = http.get(url, function (response) {
		response.pipe(file);
		file.on('finish', function () {
			file.close(cb);  // close() is async, call cb after close completes.
		});
	}).on('error', function (err) { // Handle errors
		fs.unlink(dest); // Delete the file async. (But we don't check the result)
		if (cb) cb(err.message);
	});
};

module.exports = {
    sleep: async function(ms, fn, ...args) {
      await new Promise(resolve => setTimeout(resolve, ms));
      return fn(...args);
    },
    AutoDownloadSearchJSON: async function() {
        const folderName = "./.temp/";
        const searchFile = `${folderName}resource.json`;
        await download("http://www.gamemakerkitchen.com/resource.json", searchFile, function(){
            console.log("resource.json downloaded!");
        });
    },
    extractOwnerRepo: function(url) {
        const match = url.match(/github\.com[:\/]([^\/]+)\/([^\/]+)(?:\.git)?/);
        if (match) {
          const [_, owner, repo] = match;
          return { owner, repo: repo.replace(/\.git$/, '') };
        }
        return null;
    },
    getLatestGithubRelease: async function (owner, repo) {
        const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      
        try {
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Node.js' }
          });
      
          if (response.status === 404) {
            console.log('No releases found.');
            return null;
          }
      
          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
          }
      
          const data = await response.json();
          console.log(`Latest release version: ${data.tag_name}`);
          return data;
        } catch (error) {
          console.error('Error fetching release:', error.message);
          return null;
        }
    }
}

