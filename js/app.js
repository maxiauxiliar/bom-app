document.addEventListener("DOMContentLoaded", function () {
    let materialsData = [];
    let filteredData1 = [];
    let filteredData2 = [];
    let currentSortColumn = null;
    let isAscending = true;
    let currentPage = 1;
    let rowsPerPage = 20;

    // Función para renderizar la tabla
    function renderTable(data) {
        const tableBody = document.getElementById('materials-table-body');
        tableBody.innerHTML = ''; // Limpiar tabla

        // Paginación
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        paginatedData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center">${start + index + 1}</td>
                <td>${item.ID}</td>
                <td>${item.Marca}</td>
                <td>${item.Modelo}</td>
                <td>${item.Descripción}</td>
                <td class="action-buttons" style="display: none;">
                    <button class="btn btn-danger btn-sm delete-row" style="display: none;">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-warning btn-sm edit-row">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Actualizar visibilidad de columnas según checkboxes
        document.querySelectorAll('.column-toggle').forEach(toggle => {
            const columnName = toggle.value;
            const isVisible = toggle.checked;
            const columnIndex = getColumnIndexByName(columnName);

            document.querySelectorAll(`th:nth-child(${columnIndex}), td:nth-child(${columnIndex})`).forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });
        });

        // Mostrar/Ocultar botón de eliminar según checkbox
        const showDeleteButton = document.getElementById('toggle-delete-button').checked;
        document.querySelectorAll('.delete-row').forEach(button => {
            button.style.display = showDeleteButton ? '' : 'none';
        });

        // Asociar eventos a los botones de eliminar y editar
        document.querySelectorAll('.delete-row').forEach((button, index) => {
            button.addEventListener('click', function () {
                // Obtener el índice correcto en `materialsData` basado en el ítem actual filtrado
                const actualIndex = materialsData.findIndex(item => item.ID === filteredData2[start + index].ID);
                if (actualIndex !== -1) {
                    materialsData.splice(actualIndex, 1);  // Elimina el ítem del array original
                    applyFiltersAndRenderTable();  // Reaplica los filtros y renderiza la tabla
                }
            });
        });

        document.querySelectorAll('.edit-row').forEach((button) => {
            button.addEventListener('click', function () {
                alert('Funcionalidad aún no implementada.');
            });
        });

        // Actualizar la paginación
        renderPagination(data.length);
    }

    // Función para ordenar los datos
    function sortData(column, isAsc) {
        filteredData2.sort((a, b) => {
            if (a[column] > b[column]) {
                return isAsc ? 1 : -1;
            } else if (a[column] < b[column]) {
                return isAsc ? -1 : 1;
            } else {
                return 0;
            }
        });
    }

    // Función para renderizar la paginación
    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / rowsPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', function () {
                currentPage = i;
                renderTable(filteredData2);
            });
            pagination.appendChild(li);
        }
    }

    // Función para obtener el índice de la columna por nombre
    function getColumnIndexByName(name) {
        switch (name) {
            case 'ID': return 2;
            case 'Marca': return 3;
            case 'Modelo': return 4;
            case 'Descripción': return 5;
            case 'Acciones': return 6;
            default: return -1;
        }
    }

    // Cargar los datos desde materials.json
    fetch('data/materials.json')
        .then(response => response.json())
        .then(data => {
            materialsData = data;
            filteredData1 = data; // Inicialmente, sin filtro
            filteredData2 = data; // Inicialmente, sin filtro
            renderTable(filteredData2); // Renderizar tabla con datos iniciales
        })
        .catch(error => console.error('Error al cargar los materiales:', error));

    // Primer filtro
    document.getElementById('filter-input-1').addEventListener('keyup', function () {
        applyFiltersAndRenderTable();
    });

    // Segundo filtro
    document.getElementById('filter-input-2').addEventListener('keyup', function () {
        applyFiltersAndRenderTable();
    });

    // Función para limpiar filtros
    document.getElementById('clear-filters').addEventListener('click', function () {
        document.getElementById('filter-input-1').value = '';
        document.getElementById('filter-input-2').value = '';
        applyFiltersAndRenderTable();
    });

    function applyFiltersAndRenderTable() {
        const filterText1 = document.getElementById('filter-input-1').value.toLowerCase();
        const filterText2 = document.getElementById('filter-input-2').value.toLowerCase();
        const visibleColumns = Array.from(document.querySelectorAll('.column-toggle:checked')).map(checkbox => checkbox.value);

        filteredData1 = materialsData.filter(item => {
            const itemText = Object.values(item).map(value => value.toLowerCase()).join(' ');
            return itemText.includes(filterText1);
        });

        filteredData2 = filteredData1.filter(item => {
            return visibleColumns.some(column => item[column].toLowerCase().includes(filterText2));
        });

        currentPage = 1;
        renderTable(filteredData2); // Renderizar tabla con datos filtrados
    }

    // Validación en tiempo real del campo "Modelo"
    document.getElementById('new-modelo').addEventListener('input', function () {
        const newModelo = this.value.trim().toLowerCase();
        const modeloExists = materialsData.some(item => item.Modelo.toLowerCase() === newModelo);

        if (modeloExists) {
            this.classList.add('input-error');
            this.classList.remove('input-valid');
        } else {
            this.classList.remove('input-error');
            this.classList.add('input-valid');
        }
    });

    // Exportar tabla a JSON
    document.getElementById('export-json').addEventListener('click', function () {
        const rows = document.querySelectorAll('#materials-table-body tr');
        const data = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                ID: cells[1].textContent,
                Marca: cells[2].textContent,
                Modelo: cells[3].textContent,
                Descripción: cells[4].textContent
            };
        });
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'materials.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Lógica para agregar un nuevo material
    document.getElementById('new-item').addEventListener('click', function () {
        const accordion = document.getElementById('new-item-accordion');
        accordion.style.display = accordion.style.display === 'none' ? 'block' : 'none';
    });

    // Validar y agregar nuevo material
    document.getElementById('new-item-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const newMarca = document.getElementById('new-marca').value.trim();
        const newModelo = document.getElementById('new-modelo').value.trim();
        const newDescripcion = document.getElementById('new-descripcion').value.trim();

        const modeloExists = materialsData.some(item => item.Modelo.toLowerCase() === newModelo.toLowerCase());

        if (modeloExists) {
            document.getElementById('new-modelo').classList.add('input-error');
            alert('El modelo ya existe. Por favor, ingresa un modelo diferente.');
            return;
        }

        document.getElementById('new-modelo').classList.remove('input-error');
        document.getElementById('new-modelo').classList.add('input-valid');

        // Generar un nuevo ID único de 8 caracteres
        const newID = Math.random().toString(36).substr(2, 8).toUpperCase();

        const newItem = {
            ID: newID,
            Marca: newMarca,
            Modelo: newModelo,
            Descripción: newDescripcion
        };

        materialsData.push(newItem); // Agregar el nuevo ítem a los datos
        applyFiltersAndRenderTable(); // Reaplicar filtros y renderizar la tabla

        // Limpiar el formulario
        document.getElementById('new-item-form').reset();
        document.getElementById('new-item-accordion').style.display = 'none';
        document.getElementById('new-modelo').classList.remove('input-valid');
    });

    // Mostrar/ocultar acordeón de configuración al hacer clic solo en el botón Config
    document.getElementById('config-button').addEventListener('click', function () {
        const accordion = document.getElementById('config-accordion');
        accordion.style.display = accordion.style.display === 'none' ? 'block' : 'none';
    });

    // Mostrar/ocultar columnas según checkboxes
    document.querySelectorAll('.column-toggle').forEach(toggle => {
        toggle.addEventListener('change', function () {
            applyFiltersAndRenderTable();
        });
    });

    // Mostrar/ocultar la columna de acciones
    document.getElementById('toggle-Acciones').addEventListener('change', function () {
        const isVisible = this.checked;
        document.getElementById('actions-column-header').style.display = isVisible ? '' : 'none';
        document.querySelectorAll('.action-buttons').forEach(cell => {
            cell.style.display = isVisible ? '' : 'none';
        });
    });

    // Mostrar/ocultar el botón de eliminar
    document.getElementById('toggle-delete-button').addEventListener('change', function () {
        const showDeleteButton = this.checked;
        document.querySelectorAll('.delete-row').forEach(button => {
            button.style.display = showDeleteButton ? '' : 'none';
        });
    });

    // Lógica para ordenar columnas al hacer clic en los encabezados
    document.querySelectorAll('.sort-header').forEach(header => {
        header.addEventListener('click', function () {
            const column = this.getAttribute('data-sort');
            isAscending = (currentSortColumn === column) ? !isAscending : true;
            currentSortColumn = column;

            sortData(column, isAscending);
            renderTable(filteredData2);

            // Actualizar estilos de encabezado
            document.querySelectorAll('.sort-header').forEach(header => {
                header.classList.remove('sorted-asc', 'sorted-desc');
            });
            this.classList.add(isAscending ? 'sorted-asc' : 'sorted-desc');
        });
    });

    // Cambiar el número de filas por página solo al presionar Enter
    document.getElementById('rows-per-page').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            rowsPerPage = parseInt(this.value, 10);

            // Asegurarse de que el valor esté dentro del rango permitido
            if (rowsPerPage < 5) {
                rowsPerPage = 5;
            } else if (rowsPerPage > 100) {
                rowsPerPage = 100;
            }

            this.value = rowsPerPage;  // Actualiza el valor del input si fue necesario
            currentPage = 1;  // Reiniciar a la primera página
            renderTable(filteredData2);
        }
    });
});