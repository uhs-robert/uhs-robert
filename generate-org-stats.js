const axios = require('axios');
const fs = require('fs');
const { createSVGWindow } = require('svgdom');
const { SVG, registerWindow } = require('@svgdotjs/svg.js');

// Create a window and register it
const window = createSVGWindow();
const document = window.document;
registerWindow(window, document);

const token = process.env.GH_STATS_TOKEN;
const query = `
  query {
    organization(login: "UpHill-Solutions") {
      repositories(first: 100) {
        nodes {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 0) {
                  totalCount
                }
              }
            }
          }
          pullRequests(states: MERGED) {
            totalCount
          }
          issues(states: CLOSED) {
            totalCount
          }
          stargazers {
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
  let totalCommits = 0;
  let totalPRs = 0;
  let totalIssues = 0;
  let totalStars = 0;
  let totalWatchers = 0;

  repos.forEach(repo => {
    totalCommits += repo.defaultBranchRef.target.history.totalCount;
    totalPRs += repo.pullRequests.totalCount;
    totalIssues += repo.issues.totalCount;
    totalStars += repo.stargazers.totalCount;
    totalWatchers += repo.watchers.totalCount;
  });

  const svg = SVG(document.documentElement).size(500, 200);
  svg.rect(500, 200).fill('#151515');
  svg.text('UpHill Solutions GitHub Stats').fill('#ffffff').move(20, 20).font({ size: 20 });
  svg.text(`Total Commits: ${totalCommits}`).fill('#79ff97').move(20, 60).font({ size: 16 });
  svg.text(`Total PRs: ${totalPRs}`).fill('#79ff97').move(20, 90).font({ size: 16 });
  svg.text(`Total Issues: ${totalIssues}`).fill('#79ff97').move(20, 120).font({ size: 16 });
  svg.text(`Total Stars: ${totalStars}`).fill('#79ff97').move(20, 150).font({ size: 16 });

  fs.writeFileSync('org-stats.svg', svg.svg());
})
.catch(error => {
  console.error(error);
});
