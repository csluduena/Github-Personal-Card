let showRepos = false;
let showReadme = false;

function fetchProfileData(token, username) {
    if (showRepos) {
        const headers = {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        };

        fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: `
                    {
                    user(login: "${username}") {
                        pinnedItems(first: 6, types: REPOSITORY) {
                            nodes {
                            ... on Repository {
                                name
                                description
                                html_url
                                }
                                    }
                            }
                        }
                    }
                `
            })
        })
            .then(response => response.json())
            .then(data => {
                const repos = data.data.user.pinnedItems.nodes;
                const reposHTML = repos.map(repo => `
                <div class="repo-card">
                    <h3>${repo.name}</h3>
                    <p>${repo.description || "No hay descripción disponible"}</p>
                    <a href="${repo.html_url}" target="_blank">Ver repositorio</a>
                </div>
            `).join('');
                document.getElementById('profileCard').innerHTML = `
                <div class="repo-container">
                    <div class="repo-list">${reposHTML}</div>
                </div>
            `;
            })
            .catch(error => {
                console.error('Error al obtener los repositorios anclados:', error);
            });
    } else if (showReadme) {
        fetch(`https://api.github.com/repos/${username}/${username}/readme`)
            .then(response => response.json())
            .then(data => {
                // Convertir el contenido base64 a markdown y mostrarlo
                const markdown = atob(data.content);
                document.getElementById('profileCard').innerHTML = `<div class="markdown-content"><pre>${markdown}</pre></div>`;
            })
            .catch(error => {
                console.error('Error al obtener el archivo README:', error);
            });
    } else {
        fetch(`https://api.github.com/users/${username}`)
            .then(response => response.json())
            .then(data => {
                const profileCard = `
                    <img src="${data.avatar_url}" alt="Avatar">
                    <h2>${data.name}</h2>
                    <p>${data.bio}</p>
                    <a href="${data.html_url}" target="_blank">Ver perfil de GitHub</a>
                `;
                document.getElementById('profileCard').innerHTML = profileCard;
            });
    }
}

function showPerfil() {
    showRepos = false;
    showReadme = false;
    const username = localStorage.getItem('githubUsername');
    const token = localStorage.getItem('githubToken');
    fetchProfileData(token, username);
}

function showRepositorios() {
    showRepos = true;
    showReadme = false;
    const username = localStorage.getItem('githubUsername');
    const token = localStorage.getItem('githubToken');
    fetchProfileData(token, username);
}

function showReadmeInfo() {
    showReadme = true;
    showRepos = false;
    const username = localStorage.getItem('githubUsername');
    const token = localStorage.getItem('githubToken');
    fetchProfileData(token, username);
}

document.getElementById('configForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const token = document.getElementById('token').value;
    localStorage.setItem('githubUsername', username);
    localStorage.setItem('githubToken', token);
    document.getElementById('configForm').style.display = 'none';
    document.getElementById('containerP').style.display = 'flex';
    showPerfil();
});