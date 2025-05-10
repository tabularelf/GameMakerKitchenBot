const fetch = require('node-fetch'); // Not needed in Node 18+

module.exports = {
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

