
function Game(gameDiv, gameData)
{
    var self = this;

    self.queue = [];
    var layersDiv = gameDiv.querySelector("#layers");
    var layers = [];
    var optionsDiv = gameDiv.querySelector('#options');
    optionsDiv.addEventListener("click", forwardClick);
    gameDiv.addEventListener("click", forwardClick);

    var inTimeout = false;

    function chooseOption(option)
    {
        var line = self.queue.shift();
        console.log(line);
        if (line.toUpperCase().startsWith('SCENE:'))
        {
            var layerName = line.substring('SCENE:'.length);
            layerName = layerName.replace(/ /g,'');
            showLayer(layerName);
            chooseOption(-1);
        } else {
            optionsDiv.innerHTML = line;
        }
    }

    function forwardClick()
    {
        if (inTimeout) { return; }
        inTimeout = true;
        setTimeout(()=>{inTimeout = false},300);
        chooseOption(-1);
    }

    function showLayer(name)
    {
        layers.forEach((l)=>{
            // console.log('hide: ' + l.id)
            var cl = l.classList;
            cl.remove('visible');
            cl.add('hidden');
        });
        var icl = layersDiv.querySelector('#'+name).classList;
        icl.add('visible');
        icl.remove('hidden');
    }

    function addLayer(name,src){
        return new Promise((resolve, reject) => {
          let img = new Image();
          img.onload = () => resolve(img.height);
          img.onerror = reject;
          img.src = src;
          img.id=name;
          img.classList.add('layer');
          img.classList.add('hidden');
          layersDiv.append(img);
          layers.push(img);
        });
      }

    self.bootstrap = async function()
    {
        for (const name in gameData.art) {
            const src = gameData.art[name];
            await addLayer(name,src);
        }

        var startScript = gameData.passages[gameData.start];
        self.queue = startScript;
        chooseOption(-1);
    }

    return self;
}

async function launch()
{
    window.gameData = await getJson('/data');
    var gameDiv = document.getElementById('game');
    window.game = new Game(gameDiv, window.gameData);
    await window.game.bootstrap();
    document.getElementById('loading').classList.add('hidden');
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
