/*
TODO:
    - truncute url in preview or start wrapping at lower width
    - error handling
    - Make CSS look nice
Nice to have:
    - refactoring
    - settings pane
    - better readme
*/

// Globals
const table = document.querySelector('.param-table tbody');
const addParamButton = document.querySelector('.add-param-btn');
const urlDisplay = document.querySelector('.current-url');
const goButton = document.querySelector('.go-btn');
let globalUrlObject = null;

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

function renderUrl() {
    urlDisplay.innerHTML = globalUrlObject ? globalUrlObject.toString(): '';
}

function generateTableRow(param='', value='') {
    /*
    create row of this form and append to global parameters table
    if we pass param and value, it was parsed from the current url
    so we display those values. If they are empty we know the user
    has just added a new row.
    --------------------------------------------
    - param | value | (Remove) | (Edit / Save) -
    --------------------------------------------
    */
    const row = document.createElement('tr');
    const userAddedRow = !param && !value;

    row.innerHTML =`
    <tr>
        <td>
            <div ${userAddedRow ? `contenteditable='true'`: `history='${param}'`} class="param">${param}</div>
        </td>
        <td>
            <div ${userAddedRow ? `contenteditable='true'`: `history='${value}'`} class="value">${value}</div>
        </td>
        <td class="edit-button" ${userAddedRow ? `style="display:none;"`: ''}>
            <button>Edit</button>
        </td>
        <td class="save-button" ${userAddedRow ? '': `style="display:none;"`}>
            <button>Save</button>
        </td>        
        <td class="delete-button">
            <button>Remove</button>
        </td>
    </tr>
    `;

    const thisParam = row.querySelector('.param');
    const thisValue = row.querySelector('.value');
    const deleteButton = row.querySelector('.delete-button');
    const editButton = row.querySelector('.edit-button');
    const saveButton = row.querySelector('.save-button');

    deleteButton.addEventListener('click', () => {
        if (globalUrlObject) {
            // We send value as well for the cases where there are params with the same name
            globalUrlObject.searchParams.delete(thisParam.textContent, thisValue.textContent);
        }
        renderUrl();
        row.remove();
    });
    
    editButton.addEventListener('click', () => {
        saveButton.style.display = '';
        thisParam.setAttribute('contenteditable', 'true');
        thisValue.setAttribute('contenteditable', 'true');
        editButton.style.display = 'none';
        renderUrl();
    });

    saveButton.addEventListener('click', () => {
        const thisParamBefore = thisParam.getAttribute('history') ?? '';
        const thisValueBefore = thisValue.getAttribute('history') ?? '';
        console.log(`Param history: ${thisParamBefore} value history: ${thisValueBefore}`);
        editButton.style.display = '';
        thisParam.setAttribute('contenteditable', 'false');
        thisValue.setAttribute('contenteditable', 'false');

        if (thisParam.textContent != thisParamBefore || thisValue.textContent != thisValueBefore) {
            // if we changed an existing value, delete the old
            if (globalUrlObject) {
                globalUrlObject.searchParams.delete(thisParamBefore, thisValueBefore);
            }
        }

        if (globalUrlObject && thisParam.textContent) {
            // we can have blank values but we at least need param
            globalUrlObject.searchParams.append(thisParam.textContent, thisValue.textContent);
        }

        // update history
        thisParam.setAttribute('history', thisParam.textContent);
        thisValue.setAttribute('history', thisValue.textContent);

        saveButton.style.display = 'none';
        renderUrl();
    });

    return row;
}

function generateTable(params) {
    for (const [key, value] of params){
        const row = generateTableRow(key, value);
        table.appendChild(row);
    }
}

addParamButton.addEventListener('click', () => {
    const row = generateTableRow();
    table.appendChild(row);
});

getCurrentTab().then(res => {
    globalUrlObject = new URL(res.url);
    renderUrl();
    const currentSearchParams = globalUrlObject.searchParams;
    generateTable(currentSearchParams);
})

goButton.addEventListener('click', () => {
    const newUrl = globalUrlObject.toString();
    getCurrentTab().then(tab => {
        chrome.tabs.create({url: newUrl});
        // chrome.tabs.update(undefined, { url: newUrl }); // update and navigate
    })
});

