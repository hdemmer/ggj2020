
function Game(gameDiv, gameData, state)
{
    var self = this;

    self.state = state;

    self.queue = [];
    var layersDiv = gameDiv.querySelector("#layers");
    var layers = [];
    var audioDiv= gameDiv.querySelector("#audio");;
    var audioElements = {};
    var audioLevels = {};
    var optionsDiv = gameDiv.querySelector('#options');
    optionsDiv.addEventListener("click", forwardClick);
    gameDiv.addEventListener("click", forwardClick);

    var inTimeout = false;

    function parseCommand(line)
    {
        var spl = line.split(':');
        return spl[0].toUpperCase();
    }

    function parseParam(line)
    {
        var cmd = parseCommand(line);
        var param = line.substring(cmd.length + 1);
        param = param.replace(/^ +/,'');
        return param;
    }
    const SCENE = 'scene';
    const CHAR = 'char';

    function chooseOption(optionIndex)
    {
        if (self.state.options)
        {
            if (optionIndex < 0 || optionIndex >= self.state.options.length)
            {
                console.error('option out of range: ' + optionIndex);
                return;
            }
            var chosenOption = self.state.options[optionIndex];
            self.state.options = null;
            self.queueScript(chosenOption.script);
            chooseOption(-1);
            return;
        }

        if (self.queue.length == 0)
        {
            // TODO: game over
            return;
        }
        var line = self.queue.shift();
        var cmd = parseCommand(line);
        var param = parseParam(line);
        console.log(line + "\n" + cmd + '\n' + param);
        
        if (cmd == 'SCENE')
        {
            var layerName = param;
            showLayer(SCENE,layerName);
            chooseOption(-1);
        } else if (cmd == 'CHAR')
        {
            var layerName = param;
            showLayer(CHAR,layerName);
            chooseOption(-1);
        } else if (cmd == 'MUSIC') {
            playMusic(param);
        }else if (cmd=='GOTO'){
            self.queue = [];
            self.queueScript(param);
            chooseOption(-1);
        } else {
            optionsDiv.innerHTML = line;
            window.postData('/state', {line});
        }
    }

    function forwardClick()
    {
        // TODO!: if (inTimeout) { return; }
        inTimeout = true;
        setTimeout(()=>{inTimeout = false},300);
        chooseOption(-1);
    }

    function showLayer(group,name)
    {
        layers.forEach((l)=>{
            // console.log('hide: ' + l.id)
            var cl = l.classList;
            if (cl.contains(group))
            {
                cl.remove('visible');
                cl.add('hidden');
            }
        });
        var img = layersDiv.querySelector('#'+name);
        if (!img) {
            console.error('IMAGE NOT FOUND: ' + name);
            return;
        }
        var icl = img.classList;
        icl.add('visible');
        icl.remove('hidden');
        icl.add(group);
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

    function addAudio(name,src) {
        var audioElement = new Audio(src);
        audioElement.loop = true;
        audioElements[name] = audioElement;
        audioLevels[name] = 0;
        audioDiv.append(audioElement);
    }

    var isRunningAudioUpdate = false;
    function audioUpdate()
    {
        isRunningAudioUpdate = true;
        for (var key in audioElements)
        {
            var audioElement = audioElements[key];
            var targetVolume = audioLevels[key];
            if (audioElement)
            {
                var vol = audioElement.volume;
                if (vol < targetVolume)
                {
                    vol += 0.01;
                } else if (vol > targetVolume)
                {
                    vol -= 0.01;
                }
                if (vol < 0) { vol = 0; }
                if (vol > 1) { vol = 1; }
                audioElement.volume = vol;
            }
        }
        setTimeout(audioUpdate,10);
    }

    function playMusic(name)
    {
        console.log('playing music: ' + name);
        for (var key in audioElements)
        {
            if (key != name)
            {
                audioLevels[key] = 0;
            };
        }
        audioLevels[name] = 1;
        audioElements[name].play();
        if (!isRunningAudioUpdate)
        {
            audioUpdate();
        }
    }

    self.queueScript = function(scriptName)
    {
        var script = gameData.passages[scriptName];
        self.queue = script;
    }

    self.bootstrap = async function()
    {
        for (const name in gameData.art) {
            const src = gameData.art[name];
            await addLayer(name,src);
        }

        for (const name in gameData.music) {
            const src = gameData.music[name];
            await addAudio(name,src);
        }

        self.queueScript(gameData.start);
        chooseOption(-1);
    }

    self.chooseOption = chooseOption;

    return self;
}

async function launch()
{
    var state = {
        kv:{},
        uuid:null,
        options:null
    };
    window.gameData = await getJson('/data');
    var gameDiv = document.getElementById('game');
    window.game = new Game(gameDiv, window.gameData, state);
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
