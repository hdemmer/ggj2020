
(function(){
    window.spawnEmoji = ()=>{};

    async function bootstrap()
    {
        var emojiDiv = document.getElementById('emoji');
        var emojiData = await getJson('/emoji');
        window.emojiData = emojiData;
        var html = '';

        for (var key in emojiData)
        {
            var src = emojiData[key];
            html += '<img src="'+src+'" class="hidden">'
        }

        emojiDiv.innerHTML = html;
        var overlayDiv = document.getElementById('overlay');

        var inCooldown = false;

        window.spawnEmoji = function(id)
        {
            if (inCooldown) { return; }
            inCooldown = true;
            setTimeout(()=>{inCooldown = false},100);
            var emojiData = window.emojiData;
            var src = emojiData[id];
            if (!src) { return; }
            var image = new Image();
            image.src = src;
            overlayDiv.append(image);
            var top = Math.random() * 250 + 300;
            var left = Math.random() * 1500 + 210;
            var size = 256 * (Math.random() * 0.4 + 0.6);
            image.style.top = top+'px';
            image.style.left = left+'px';
            image.style.width = size + 'px';
            image.style.height = size + 'px';
            image.classList.add('emojiFlying');
            overlayDiv.append(image);
            setTimeout(function(){
                image.remove();
            }, 3000);
        }
    }



    window.emojifly = { bootstrap };
})();