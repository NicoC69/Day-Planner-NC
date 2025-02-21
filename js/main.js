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

    const selectedDate = document.getElementById('datepicker').value;
    const listNameBase = document.getElementById('listName').value.trim();
    const listName = selectedDate ? `${listNameBase} - ${selectedDate}` : listNameBase;

    if (!listName) {
        alert("Please enter a name before saving.");
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

    // Reset input fields and start a new list
    document.getElementById('todoList').innerHTML = ''; // Clears the list
    document.getElementById('listName').value = ''; // Clears the list name field
    document.getElementById('todoInput').value = ''; // Clears the input field
    document.getElementById('datepicker').value = ''; // Clears the date field
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
        alert("Error: We couldnt find the list. Try again/No se encontró la lista actual. Intente cargarla nuevamente.");
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
        alert("Please, choose a name before save/Por favor, ingrese un nombre para la lista antes de guardar.");
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

//---   imprimir la lista

function printSelectedTodoList() {
    const selectedTimestamp = document.getElementById('savedTodoLists').value;
    if (!selectedTimestamp) {
        alert("Please select a list to print.");
        return;
    }

    const savedLists = getSavedTodoLists();
    const selectedList = savedLists[selectedTimestamp];

    if (!selectedList) {
        alert("Error: List not found.");
        return;
    }

    // Create a new hidden div to render the content
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '100%';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.padding = '20px';
    printContainer.style.color = 'black'; // Ensures text is dark
    printContainer.style.fontFamily = 'Arial, sans-serif'; // Use a clear font

    // Add list content
    printContainer.innerHTML = `
        <h1 style="color: black; text-align: center;">${selectedList.name}</h1>
        <ul style="color: black; font-size: 18px; list-style: none; padding: 0;">
            ${selectedList.items.map(item => `<li style="margin-bottom: 10px; padding: 5px; border-bottom: 1px solid #ccc;">${item.text}</li>`).join('')}
        </ul>
    `;

    document.body.appendChild(printContainer);

    // Use html2canvas to take a screenshot
    html2canvas(printContainer).then(canvas => {
        const image = canvas.toDataURL("image/png");

        // Create a download link
        const link = document.createElement('a');
        link.href = image;
        link.download = `${selectedList.name}.png`;
        link.click();

        // Remove the temporary container
        document.body.removeChild(printContainer);
    });
}

/*
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
*/

//-- Screenshot option
/* function printSelectedTodoList() {
    const todoSection = document.querySelector(".container"); // Capture the entire to-do list section

    html2canvas(todoSection, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png"); // Convert screenshot to image
        link.download = "todo_list_screenshot.png"; // Set download filename
        link.click(); // Trigger download
    });
} */

//-------------- Clima

const apiKey = "cc1d550f7c87723a9aab4748c6d51f20";

function obtenerClima() {
    const ciudad = document.getElementById("ciudadInput").value;

    if (!ciudad) {
        alert("Por favor ingresa una ciudad/Please choose a city.");
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error");
            }
            return response.json();
        })
        .then(data => {
            const tempCelsius = Math.round(data.main.temp);
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            document.getElementById("temperatura").textContent = `${tempCelsius}°C / ${tempFahrenheit}°F`;
            document.getElementById("descripcion").textContent = data.weather[0].description;
            document.getElementById("humedad").textContent = `Humidity: ${data.main.humidity}%`;
            document.getElementById("viento").textContent = `Wind Speed: ${data.wind.speed} m/s`;

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
            alert("Algo salio mal, por favor intente de nuevo. Somthing went wrong, please try again.");
        });
}

// ----- Calendario

/* var picker = new Pikaday({
    field: document.getElementById('datepicker') 
}); */

/* var picker = new Pikaday({
    field: document.getElementById('datepicker'),
    format: 'DD/MM/YYYY'
}); */

new Pikaday({
    field: document.getElementById("datepicker"),
    format: "MM/DD/YYYY", // Ensure this matches what you want
    onSelect: function (date) {
        document.getElementById("datepicker").value = this.getMoment().format("MM/DD/YYYY");
    }
});