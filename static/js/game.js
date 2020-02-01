
function Game(gameDiv, gameData, state)
{
    var self = this;

    self.state = state;
    self.options = null;
    self.waitTimeout = null;
    function killWaitTimeout()
    {
        clearTimeout(self.waitTimeout);
        self.waitTimeout = null;
    }

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

    function setFlag(flag,value)
    {
        self.state[flag] = value;
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

    function evalDotCommand(cmd, param)
    {
        cmd = cmd.replace('DOT_','');
        if (self.state[cmd])
        {
            self.queueScript(param);
        }
    }

    function showDot()
    {
        var mom = 0;
        var jules = 0;
        var grandpa = 0;
        if (self.state['MOM']){mom = 1;}
        if (self.state['MOM_GOOD']){mom = 2;}
        if (self.state['JULES']){jules = 1;}
        if (self.state['JULES_GOOD']){jules = 2;}
        if (self.state['GRANDPA']){grandpa = 1;}
        if (self.state['GRANDPA_GOOD']){grandpa = 2;}

        var layerName =  'dot'
            +jules
            +mom
            +grandpa;
        showLayer(SCENE,layerName);
        showLayer(CHAR,'');
    }

    function chooseOption(optionIndex)
    {
        if (inTimeout) { return; }
        inTimeout = true;
        setTimeout(()=>{inTimeout = false},50);
        killWaitTimeout();
        
        optionsDiv.classList.remove('hiddenOption');
        if (self.options)
        {
            if (optionIndex < 0 || optionIndex >= self.options.length)
            {
                console.error('option out of range: ' + optionIndex);
                return;
            }
            var chosenOption = self.options[optionIndex];
            self.options = null;
            self.queueScript(chosenOption.script);
            advance();
        } else {
            advance();
        }
    }
    
    function advance()
    {
        if (self.queue.length == 0)
        {
            // game over
            self.state = {};
            self.queueScript(gameData.start);
            
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
            advance();
        } else if (cmd == 'CHAR')
        {
            var layerName = param;
            showLayer(CHAR,layerName);
            advance();
        } else if (cmd == 'MUSIC') {
            playMusic(param);
            advance();
        }else if (cmd == 'GOTO'){
            self.queue = [];
            self.queueScript(param);
            advance();
        } else if (cmd == 'WAIT') {
            optionsDiv.classList.add('hiddenOption');
            if (param)
            {
                var timeout = parseInt(param,10);
                console.log(timeout);
                if (timeout)
                {
                    self.waitTimeout = setTimeout(forwardClick,timeout);
                }
            }
        } else if (cmd == 'OPTIONS') {
            var options = self.queue.map((line)=>{
                var spl = line.split('|');
                return {text:spl[0],script:spl[1]};
            });
            self.options = options;
            var html = '';
            for (var i = 0; i < options.length; i++)
            {
                var option = options[i];
                html += '<div onclick="window.game.chooseOption('+i+')">'+option.text+'</div>'
            }
            optionsDiv.innerHTML = html;
        } else if (cmd == 'SET') {
            setFlag(param,true);
            advance();
        } else if (cmd.startsWith('DOT')) {
            evalDotCommand(cmd,param);
            advance();
        } else if (cmd == 'SHOWDOT') {
            showDot();
            advance();
        } else {
            optionsDiv.innerHTML = line;
        }
    }

    function forwardClick()
    {
        if (self.options)
        {
            return;
        }
        chooseOption(-1);
    }

    function showLayer(group,name)
    {
        layers.forEach((l)=>{
            // console.log('hide: ' + l.id)
            var cl = l.classList;
            if (cl.contains(group) && (l.id != name))
            {
                cl.add('hidden');
            }
        });
        if (name)
        {
            var img = layersDiv.querySelector('#'+name);
            if (!img) {
                console.error('IMAGE NOT FOUND: ' + name);
                return;
            }
            var icl = img.classList;
            icl.add(group);
            icl.remove('hidden');
        }
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
        var script = JSON.parse(JSON.stringify(gameData.passages[scriptName]));
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
        advance();
    }

    self.chooseOption = chooseOption;
    self.advance = advance;
    self.setFlag = setFlag;

    return self;
}

async function launch()
{
    var state = {
    };
    window.gameData = await getJson('/data');
    var gameDiv = document.getElementById('game');
    window.game = new Game(gameDiv, window.gameData, state);
    await window.game.bootstrap();
    await window.emojifly.bootstrap();
    document.getElementById('loading').classList.add('hiddenLoading');
}

function start()
{
    launch();
}
