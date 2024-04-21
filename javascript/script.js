// Requerir el módulo 'dotenv'
require('dotenv').config();

// Acceder a las variables de entorno
const username = process.env.GITHUB_USERNAME; //Reemplazar "process.env.GITHUB_USERNAME" por tu GitHub User
const token = process.env.GITHUB_TOKEN; //Reemplazar "process.env.GITHUB_TOKEN" por tu GitHub token.

// Aquí es donde el usuario debe poner su nombre de usuario y token
// NOTA PARA EL USUARIO: Reemplaza 'nombre_de_usuario_de_GitHub' y 'token_de_acceso_personal_de_GitHub'
// con tu nombre de usuario de GitHub y tu token de acceso personal.
// const username = "nombre_de_usuario_de_GitHub";
// const token = "token_de_acceso_personal_de_GitHub";


let showRepos = false;
let showReadme = false;

function fetchProfileData() {
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
                            url
                            homepageUrl
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
                // Comprobar si la respuesta contiene los datos esperados
                if (data && data.data && data.data.user && data.data.user.pinnedItems && data.data.user.pinnedItems.nodes) {
                    const repos = data.data.user.pinnedItems.nodes;
                    const reposHTML = repos.map(repo => `
                        <div class="repo-card">
                            <h3>${repo.name}</h3>
                            <a href="${repo.url}" target="_blank">Ver repositorio</a><br><br>
                            <a href="${repo.homepageUrl}" target="_blank">Ver en GitHub Pages</a>
                        </div>
                    `).join('');
                    document.getElementById('profileCard').innerHTML = reposHTML;
                } else {
                    console.error('La respuesta de la API no contiene los datos esperados.');
                }
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

// Función para mostrar el perfil
function showPerfil() {
    showRepos = false;
    showReadme = false;
    fetchProfileData();
}

// Función para mostrar los repositorios
function showRepositorios() {
    showRepos = true;
    showReadme = false;
    fetchProfileData();
}

// Función para mostrar el README
function showReadmeInfo() {
    showReadme = true;
    showRepos = false;
    fetchProfileData();
}

// Se llama a la función showPerfil cuando la página se carga por primera vez
showPerfil();

