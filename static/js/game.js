
function Game()
{
    var self = this;

    

    return self;
}

async function launch()
{
    window.gameData = await getJson('/data');
    window.game = new Game(window.gameData);
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
        window.app.onError(response);
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
        window.app.onError(response);
        throw response.status;
    }
}
