const myButton = document.querySelector('.test-btn');

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

function generateTable(params) {
    var table = document.querySelector('.param-table');
    for (const [key, value] of params){
        var row = document.createElement('tr');   

        var paramColumn = document.createElement('td');
        paramColumn.setAttribute('contenteditable','true')
        var valueColumn = document.createElement('td');
        valueColumn.setAttribute('contenteditable','true')

        var paramText = document.createTextNode(key);
        var valueText = document.createTextNode(value);

        paramColumn.appendChild(paramText);
        valueColumn.appendChild(valueText);
        row.appendChild(paramColumn);
        row.appendChild(valueColumn);

        table.appendChild(row);
    }
}

getCurrentTab().then(res => {
    console.log(res)
    const urlHtml = document.querySelector('.current-url');
    urlHtml.innerHTML = res.url;

    const urlObject = new URL(res.url);
    generateTable(urlObject.searchParams);
})

myButton.addEventListener('click', () => {
    getCurrentTab().then(tab => {
        chrome.tabs.update(undefined, { url: 'https://google.com' }); // update and navigate
    })
});

