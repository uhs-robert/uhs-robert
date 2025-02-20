const axios = require('axios');
const fs = require('fs');

const token = process.env.GH_STATS_TOKEN;
const query = `
  query {
    organization(login: "UpHill-Solutions") {
      repositories(first: 100) {
        nodes {
          name
          stargazers {
            totalCount
          }
          forks {
            totalCount
          }
          watchers {
            totalCount
          }
        }
      }
    }
  }
`;

axios.post(
  'https://api.github.com/graphql',
  { query },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
)
.then(response => {
  const repos = response.data.data.organization.repositories.nodes;
  let stats = '## UpHill Solutions GitHub Stats\n\n';
  repos.forEach(repo => {
    stats += `### ${repo.name}\n`;
    stats += `- Stars: ${repo.stargazers.totalCount}\n`;
    stats += `- Forks: ${repo.forks.totalCount}\n`;
    stats += `- Watchers: ${repo.watchers.totalCount}\n\n`;
  });
  fs.writeFileSync('org-stats.md', stats);
})
.catch(error => {
  console.error(error);
});
