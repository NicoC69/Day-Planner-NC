document.getElementById('todoInput').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
});

function addTodo() {
    const inputValue = document.getElementById('todoInput').value.trim();

    if (!inputValue) return;

    const li = document.createElement('li');
    li.textContent = inputValue;

    li.addEventListener('click', function() {
        if (li.style.textDecoration === 'line-through') {
            li.style.textDecoration = 'none';
        } else {
            li.style.textDecoration = 'line-through';
        }
    });

    document.getElementById('todoList').appendChild(li);
    document.getElementById('todoInput').value = '';
}

function saveTodoList() {
    const todoItems = [];
    const lis = document.getElementById('todoList').querySelectorAll('li');

    lis.forEach(function(li) {
        todoItems.push({
            text: li.textContent,
            completed: li.style.textDecoration === 'line-through'
        });
    });

    const listName = document.getElementById('listName').value.trim();
    if (!listName) {
        alert("Please, choose a name for the list before save / Por favor, ingrese un nombre para la lista antes de guardar.");
        return;
    }

    const savedLists = getSavedTodoLists();
    const timestamp = new Date().toISOString();
    savedLists[timestamp] = {
        name: listName,
        items: todoItems
    };

    localStorage.setItem('todoLists', JSON.stringify(savedLists));
    updateSavedTodoListsDropdown();
}



function newTodoList() {
    document.getElementById('todoList').innerHTML = '';
    document.getElementById('listName').value = '';
}

function getSavedTodoLists() {
    const savedLists = localStorage.getItem('todoLists');
    return savedLists ? JSON.parse(savedLists) : {};
}

function updateSavedTodoListsDropdown() {
    const dropdown = document.getElementById('savedTodoLists');
    dropdown.innerHTML = '';

    const savedLists = getSavedTodoLists();
    for (let timestamp in savedLists) {
        const option = document.createElement('option');
        option.value = timestamp;
        option.textContent = `${savedLists[timestamp].name} - ${new Date(timestamp).toLocaleString()}`;
        dropdown.appendChild(option);
    }
}

let currentListTimestamp = null;

function loadSelectedTodoList() {
    const dropdown = document.getElementById('savedTodoLists');
    const selectedTimestamp = dropdown.value;
    if (!selectedTimestamp) return;

    const savedLists = getSavedTodoLists();
    const selectedList = savedLists[selectedTimestamp];

    document.getElementById('listName').value = selectedList.name;

    const todoListEl = document.getElementById('todoList');
    todoListEl.innerHTML = '';
    selectedList.items.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent = item.text;
        if (item.completed) {
            li.style.textDecoration = 'line-through';
        }

        li.addEventListener('click', function() {
            if (li.style.textDecoration === 'line-through') {
                li.style.textDecoration = 'none';
            } else {
                li.style.textDecoration = 'line-through';
            }
        });

        todoListEl.appendChild(li);
    });

    currentListTimestamp = selectedTimestamp;
}

function deleteSelectedTodoList() {
    const dropdown = document.getElementById('savedTodoLists');
    const selectedTimestamp = dropdown.value;

    if (!selectedTimestamp) return;

    const savedLists = getSavedTodoLists();

    if (confirm(`Confirm you want to delete list? / ¿Estás seguro de que deseas eliminar la lista "${savedLists[selectedTimestamp].name}" del ${new Date(selectedTimestamp).toLocaleString()}?`)) {
        delete savedLists[selectedTimestamp];
        localStorage.setItem('todoLists', JSON.stringify(savedLists));
        updateSavedTodoListsDropdown();
    }
}

function updateCurrentTodoList() {
    if (!currentListTimestamp) {
        alert("Choose a list first / Primero debe cargar una lista para guardar cambios en ella.");
        return;
    }

    const savedLists = getSavedTodoLists();
    const currentList = savedLists[currentListTimestamp];
    if (!currentList) {
        alert("Error: We couldnt find the list. Try again / No se encontró la lista actual. Intente cargarla nuevamente.");
        return;
    }

    const todoItems = [];
    const lis = document.getElementById('todoList').querySelectorAll('li');
    lis.forEach(function(li) {
        todoItems.push({
            text: li.textContent,
            completed: li.style.textDecoration === 'line-through'
        });
    });

    const listName = document.getElementById('listName').value.trim();
    if (!listName) {
        alert("Please, choose a name before save / Por favor, ingrese un nombre para la lista antes de guardar.");
        return;
    }

    currentList.name = listName;
    currentList.items = todoItems;

    localStorage.setItem('todoLists', JSON.stringify(savedLists));
    updateSavedTodoListsDropdown();
}


window.onload = function() {
    updateSavedTodoListsDropdown();
};

//--- Opcion imprimir la lista

function printSelectedTodoList() {
    const selectedTimestamp = document.getElementById('savedTodoLists').value;
    if (!selectedTimestamp) {
        alert("Por favor, seleccione una lista para imprimir.");
        return;
    }

    const savedLists = getSavedTodoLists();
    const selectedList = savedLists[selectedTimestamp];

    if (!selectedList) {
        alert("Error: No se encontró la lista seleccionada.");
        return;
    }

    let printWindow = window.open('', '_blank');

    let content = `<html>
        <head>
            <title>${selectedList.name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
            </style>
        </head>
        <body>
            <h1>${selectedList.name}</h1>
            <ul>`;
    
    selectedList.items.forEach(item => {
        content += `<li>${item.text}</li>`;
    });

    content += `</ul></body></html>`;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
}

//-------------- Clima

const apiKey = "cc1d550f7c87723a9aab4748c6d51f20";

function obtenerClima() {
    const ciudad = document.getElementById("ciudadInput").value;

    if (!ciudad) {
        alert("Por favor ingresa una ciudad.");
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener el clima");
            }
            return response.json();
        })
        .then(data => {
            const tempCelsius = Math.round(data.main.temp);
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            document.getElementById("temperatura").textContent = `${tempCelsius}°C / ${tempFahrenheit}°F`;

            const iconCode = data.weather[0].icon;
            if (iconCode) {
            const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
            const iconElement = document.getElementById("iconoClima");
            iconElement.src = iconUrl;
            iconElement.style.display = "block";
            }        
        })
        .catch(error => {
            console.log("Error:", error);
            alert("No se pudo obtener el clima para esa ciudad. Asegúrate de haberla escrito correctamente.");
        });
}
