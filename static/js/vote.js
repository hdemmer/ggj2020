

async function bootstrap()
{
    var emojiData = await getJson('/emoji');
    window.emojiData = emojiData;
    var emojiDiv = document.getElementById('emoji');
    var html = '';

    for (var key in emojiData)
    {
        var src = emojiData[key];
        html += '<button onclick="postEmoji(\''+key+'\')"><img src="'+src+'"></button>'
    }

    emojiDiv.innerHTML = html;
}

function postEmoji(id)
{
    console.log('id ' + id);
    window.postData('/emoji',{id:id});
}

function start()
{
    bootstrap();
}