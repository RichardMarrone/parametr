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

function deleteOne(params, key, value) {
    // For example when we have a=1 and a=1, we only want to delete
    // one of these. Specifying calling default delete('a', '1') deletes both
    if (!params.has(key,value)) {
        return;
    }
    const allKeys = params.getAll(key).filter(entry => entry == value);
    params.delete(key, value);
    allKeys.pop();
    allKeys.forEach(entry => params.append(key, entry));
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
            if (globalUrlObject) {
                deleteOne(globalUrlObject.searchParams, thisParamBefore, thisValueBefore);
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
            deleteOne(globalUrlObject.searchParams, thisParam.textContent, thisValue.textContent);
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