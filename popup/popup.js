// Globals
const table = document.querySelector('.param-table tbody');
const addParamButton = document.querySelector('.add-param-btn');
const urlDisplay = document.querySelector('.current-url p');
const goButton = document.querySelector('.go-btn');
let globalUrlObject = null;

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

function renderUrl() {
    if (globalUrlObject) {
        urlDisplay.innerHTML = globalUrlObject.toString()
        urlDisplay.setAttribute('title', globalUrlObject.toString());
    }
}

function generateTableRow (param='', value='') {
    const row = document.createElement('tr');
    const userAddedRow = !param && !value;

    row.innerHTML =`
    <tr>
        <td>
            <div contenteditable='true' ${userAddedRow ? '': `history='${param}'`} class="param">${param}</div>
        </td>
        <td>
            <div contenteditable='true' ${userAddedRow ? '': `history='${value}'`} class="value">${value}</div>
        </td>
        <td class="row-buttons-section">
            <div class="delete-button fa-solid fa-trash-can"></div>
        </td>
    </tr>
    `;
    const thisParam = row.querySelector('.param');
    const thisValue = row.querySelector('.value');
    const deleteButton = row.querySelector('.delete-button');

    thisParam.addEventListener('click', () => thisParam.focus());
    thisValue.addEventListener('click', () => thisValue.focus());

    let paramTimeout;
    let valueTimeout;
    const debounceInterval = 10;

    const onTextChanged = () => {
        const thisParamBefore = thisParam.getAttribute('history') ?? '';
        const thisValueBefore = thisValue.getAttribute('history') ?? '';

        if (thisParam.textContent != thisParamBefore || thisValue.textContent != thisValueBefore) {
            // if we changed an existing value, delete the old, add new, update history attr
            if (globalUrlObject) {
                globalUrlObject.searchParams.delete(thisParamBefore, thisValueBefore);
            }

            if (globalUrlObject && thisParam.textContent) {
                // we can have blank values but we at least need param
                globalUrlObject.searchParams.append(thisParam.textContent, thisValue.textContent);
            }
    
            // update history
            thisParam.setAttribute('history', thisParam.textContent);
            thisValue.setAttribute('history', thisValue.textContent);
            renderUrl();
        }
    };

    thisParam.addEventListener('keyup',() => {
        clearTimeout(paramTimeout);
        paramTimeout = setTimeout(onTextChanged, debounceInterval);
    });

    thisValue.addEventListener('keyup',() => {
        clearTimeout(valueTimeout);
        valueTimeout = setTimeout(onTextChanged, debounceInterval);
    });

    deleteButton.addEventListener('click', () => {
        if (globalUrlObject) {
            // We send value as well for the cases where there are params with the same name
            globalUrlObject.searchParams.delete(thisParam.textContent, thisValue.textContent);
        }
        renderUrl();
        row.remove();
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

goButton.addEventListener('click', () => {
    const newUrl = globalUrlObject.toString();
    getCurrentTab().then(tab => {
        chrome.tabs.create({url: newUrl});
    });
});

getCurrentTab().then(res => {
    globalUrlObject = new URL(res.url);
    renderUrl();
    const currentSearchParams = globalUrlObject.searchParams;
    generateTable(currentSearchParams);
});