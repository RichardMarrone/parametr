// elements
var table = document.querySelector('.param-table');
const paramButton = document.querySelector('.add-param-btn');

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

function generateTableRow(param='', value='') {
    /*
    create row of this form and append to global parameters table
    ----------------------------
    - param | value | (Remove) -
    ----------------------------
    */
    const row = document.createElement('tr');   

    const paramColumn = document.createElement('td');
    paramColumn.setAttribute('contenteditable','true')
    const valueColumn = document.createElement('td');
    valueColumn.setAttribute('contenteditable','true')

    const paramText = document.createTextNode(param);
    const valueText = document.createTextNode(value);

    paramColumn.appendChild(paramText);
    valueColumn.appendChild(valueText);
    row.appendChild(paramColumn);
    row.appendChild(valueColumn);

    const deleteButtonCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    const deleteText = document.createTextNode('Remove');

    deleteButton.addEventListener('click', () => {
        row.remove();
    })
    deleteButton.appendChild(deleteText);
    deleteButtonCell.appendChild(deleteButton);
    row.appendChild(deleteButtonCell);
    return row;
}

function generateTable(params) {
    for (const [key, value] of params){
        const row = generateTableRow(key, value);
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

paramButton.addEventListener('click', () => {
    const row = generateTableRow();
    table.appendChild(row);
});


// const myButton = document.querySelector('.test-btn');
// myButton.addEventListener('click', () => {
//     getCurrentTab().then(tab => {
//         chrome.tabs.update(undefined, { url: 'https://google.com' }); // update and navigate
//     })
// });

