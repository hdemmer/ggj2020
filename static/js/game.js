
function Game(gameDiv, gameData)
{
    var self = this;

    var state = null;
    var layersDiv = gameDiv.querySelector("#layers");

    function addLayer(name,src){
        return new Promise((resolve, reject) => {
          let img = new Image();
          img.onload = () => resolve(img.height);
          img.onerror = reject;
          img.src = src;
          img.id='layer-'+name;
          img.classList.add('layer');
          layersDiv.append(img);
        });
      }

    self.bootstrap = async function()
    {
        for (const name in gameData.art) {
            const src = gameData.art[name];
            await addLayer(name,src);
        }
    }

    return self;
}

async function launch()
{
    window.gameData = await getJson('/data');
    var gameDiv = document.getElementById('game');
    window.game = new Game(gameDiv, window.gameData);
    await window.game.bootstrap();
}

function start()
{
    launch();
}

window.getJson = async function(url)
{
    const response = await fetch(url);
    if (response.ok)
    {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        console.error(response);
        throw response.status;
    }
}

window.postData = async function (url, data) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    if (response.ok)
    {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        console.error(response);
        throw response.status;
    }
}
