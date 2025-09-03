class CarrilPreferencialDashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.charts = {};
        
        this.init();
    }

    async init() {
        console.log('Inicializando dashboard...');
        
        try {
            // Configurar event listeners primero
            this.setupEventListeners();
            console.log('Event listeners configurados');
            
            // Cargar datos
            await this.loadData();
            console.log('Datos cargados');
            
            // Crear gráficas
            this.createCharts();
            console.log('Gráficas creadas');
            
            // Poblar filtros y actualizar
            this.populateFilters();
            this.updateStats();
            this.updateCharts();
            
            console.log('Dashboard inicializado completamente');
        } catch (error) {
            console.error('Error durante la inicialización:', error);
            this.showError('Error inicializando el dashboard: ' + error.message);
        }
    }

    async loadData() {
        try {
            console.log('Iniciando carga de datos...');
            // Intentar cargar el archivo principal primero
            const response = await fetch('20250903_CarrilPreferencial_final.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            console.log('CSV cargado, tamaño:', csvText.length, 'caracteres');
            
            this.data = this.parseCSV(csvText);
            if (!this.data || this.data.length === 0) {
                throw new Error('Los datos del CSV están vacíos o son inválidos');
            }
            
            this.filteredData = [...this.data];
            console.log(`Datos cargados: ${this.data.length} registros`);
            console.log('Primeros 3 registros:', this.data.slice(0, 3));
            
            console.log('Datos principales cargados exitosamente');
        } catch (error) {
            console.error('Error cargando datos principales:', error);
            console.log('Intentando cargar datos de prueba...');
            // Si falla, cargar datos de prueba
            await this.loadTestData();
        }
    }

    async loadTestData() {
        try {
            console.log('Cargando datos de prueba...');
            const response = await fetch('test_data.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            console.log('Datos de prueba cargados, tamaño:', csvText.length, 'caracteres');
            this.data = this.parseCSV(csvText);
            this.filteredData = [...this.data];
            console.log(`Datos de prueba cargados: ${this.data.length} registros`);
            console.log('Primeros 3 registros:', this.data.slice(0, 3));
            
            // Actualizar interfaz solo si los datos se cargaron correctamente
            if (this.data && this.data.length > 0) {
                this.populateFilters();
                this.updateStats();
                this.updateCharts();
                
                this.showMessage('Datos de prueba cargados correctamente. Usa los filtros para ver las gráficas.');
            } else {
                throw new Error('Los datos de prueba están vacíos o son inválidos');
            }
        } catch (error) {
            console.error('Error cargando datos de prueba:', error);
            this.showError('Error cargando los datos de prueba: ' + error.message);
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        console.log('Total de líneas en CSV:', lines.length);
        console.log('Headers:', lines[0]);
        
        // Filtrar líneas vacías
        const dataLines = lines.slice(1).filter(line => line.trim() !== '');
        console.log('Líneas de datos a procesar:', dataLines.length);
        
        return dataLines.map((line, index) => {
            try {
                const values = line.split(',');
                if (values.length < 11) {
                    console.warn(`Línea ${index + 1} tiene menos de 11 valores:`, values);
                    return null;
                }
                
                const congestion = parseFloat(values[10]);
                if (isNaN(congestion)) {
                    console.warn(`Línea ${index + 1} tiene congestión inválida:`, values[10]);
                    return null;
                }
                
                return {
                    fecha: values[0],
                    hora: values[1],
                    semana: values[2],
                    dia: values[3],
                    mes: values[4],
                    tipoDia: values[5],
                    carril: values[6],
                    sentido: values[7],
                    desde: values[8],
                    hasta: values[9],
                    congestion: congestion
                };
            } catch (error) {
                console.error(`Error procesando línea ${index + 1}:`, error, line);
                return null;
            }
        }).filter(item => item !== null);
    }

    setupEventListeners() {
        // Filtros
        document.getElementById('yearFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFromFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateToFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dayFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dayTypeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('carrilFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('desdeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('hastaFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sentidoFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('hourFilter').addEventListener('change', () => this.applyFilters());
        
        // Botón reset
        document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
    }

    populateFilters() {
        // Verificar que los datos estén disponibles
        if (!this.data || this.data.length === 0) {
            console.warn('No hay datos disponibles para poblar los filtros');
            return;
        }

        console.log('Poblando filtros con', this.data.length, 'registros');

        // Limpiar filtros existentes primero
        this.clearFilters();

        // Poblar filtro de años
        const years = [...new Set(this.data.map(item => {
            try {
                return new Date(item.fecha).getFullYear();
            } catch (error) {
                console.warn('Error procesando fecha:', item.fecha, error);
                return null;
            }
        }))].filter(year => year !== null).sort();
        
        console.log('Años encontrados:', years);
        const yearFilter = document.getElementById('yearFilter');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Poblar filtro de carriles
        const carriles = [...new Set(this.data.map(item => item.carril))].filter(c => c && c.trim() !== '').sort();
        console.log('Carriles encontrados:', carriles);
        const carrilFilter = document.getElementById('carrilFilter');
        carriles.forEach(carril => {
            const option = document.createElement('option');
            option.value = carril;
            option.textContent = carril;
            carrilFilter.appendChild(option);
        });

        // Poblar filtro de puntos desde
        const desdePuntos = [...new Set(this.data.map(item => item.desde))].filter(d => d && d.trim() !== '').sort();
        console.log('Puntos desde encontrados:', desdePuntos);
        const desdeFilter = document.getElementById('desdeFilter');
        desdePuntos.forEach(punto => {
            const option = document.createElement('option');
            option.value = punto;
            option.textContent = punto;
            desdeFilter.appendChild(option);
        });

        // Poblar filtro de puntos hasta
        const hastaPuntos = [...new Set(this.data.map(item => item.hasta))].filter(h => h && h.trim() !== '').sort();
        console.log('Puntos hasta encontrados:', hastaPuntos);
        const hastaFilter = document.getElementById('hastaFilter');
        hastaPuntos.forEach(punto => {
            const option = document.createElement('option');
            option.value = punto;
            option.textContent = punto;
            hastaFilter.appendChild(option);
        });

        console.log('Filtros poblados correctamente');
    }

    clearFilters() {
        // Limpiar filtro de años
        const yearFilter = document.getElementById('yearFilter');
        yearFilter.innerHTML = '<option value="">Todos los años</option>';
        
        // Limpiar filtro de carriles
        const carrilFilter = document.getElementById('carrilFilter');
        carrilFilter.innerHTML = '<option value="">Todos los carriles</option>';
        
        // Limpiar filtro de puntos desde
        const desdeFilter = document.getElementById('desdeFilter');
        desdeFilter.innerHTML = '<option value="">Todos los puntos</option>';
        
        // Limpiar filtro de puntos hasta
        const hastaFilter = document.getElementById('hastaFilter');
        hastaFilter.innerHTML = '<option value="">Todos los puntos</option>';
        
        console.log('Filtros limpiados');
    }

    applyFilters() {
        const yearFilter = document.getElementById('yearFilter').value;
        const dateFromFilter = document.getElementById('dateFromFilter').value;
        const dateToFilter = document.getElementById('dateToFilter').value;
        const dayFilter = document.getElementById('dayFilter').value;
        const dayTypeFilter = document.getElementById('dayTypeFilter').value;
        const carrilFilter = document.getElementById('carrilFilter').value;
        const desdeFilter = document.getElementById('desdeFilter').value;
        const hastaFilter = document.getElementById('hastaFilter').value;
        const sentidoFilter = document.getElementById('sentidoFilter').value;
        const hourFilter = document.getElementById('hourFilter').value;

        this.filteredData = this.data.filter(item => {
            const yearMatch = !yearFilter || new Date(item.fecha).getFullYear() == yearFilter;
            const dateFromMatch = !dateFromFilter || item.fecha >= dateFromFilter;
            const dateToMatch = !dateToFilter || item.fecha <= dateToFilter;
            const dayMatch = !dayFilter || item.dia === dayFilter;
            const dayTypeMatch = !dayTypeFilter || item.tipoDia === dayTypeFilter;
            const carrilMatch = !carrilFilter || item.carril === carrilFilter;
            const desdeMatch = !desdeFilter || item.desde === desdeFilter;
            const hastaMatch = !hastaFilter || item.hasta === hastaFilter;
            const sentidoMatch = !sentidoFilter || item.sentido === sentidoFilter;
            const hourMatch = !hourFilter || item.hora.startsWith(hourFilter + ':');

            return yearMatch && dateFromMatch && dateToMatch && dayMatch && dayTypeMatch && 
                   carrilMatch && desdeMatch && hastaMatch && sentidoMatch && hourMatch;
        });

        this.updateStats();
        this.updateCharts();
    }

    resetFilters() {
        document.getElementById('yearFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('dayFilter').value = '';
        document.getElementById('dayTypeFilter').value = '';
        document.getElementById('carrilFilter').value = '';
        document.getElementById('desdeFilter').value = '';
        document.getElementById('hastaFilter').value = '';
        document.getElementById('sentidoFilter').value = '';
        document.getElementById('hourFilter').value = '';
        
        this.filteredData = [...this.data];
        this.updateStats();
        this.updateCharts();
    }

    updateStats() {
        // Verificar que los datos estén disponibles
        if (!this.filteredData || this.filteredData.length === 0) {
            console.warn('No hay datos filtrados para actualizar estadísticas');
            return;
        }

        // Las estadísticas ahora se muestran en el histograma
        // Solo actualizamos las gráficas
        console.log('Estadísticas actualizadas en el histograma con', this.filteredData.length, 'registros');
    }

    createCharts() {
        console.log('Creando gráficas...');
        
        try {
            this.createTimeSeriesChart();
            this.createHourlyProfileChart();
            this.createHistogramChart();
            console.log('Todas las gráficas creadas correctamente');
        } catch (error) {
            console.error('Error creando gráficas:', error);
        }
    }

    createTimeSeriesChart() {
        const ctx = document.getElementById('timeSeriesChart').getContext('2d');
        this.charts.timeSeries = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    title: {
                        display: true,
                        text: 'Evolución de la Congestión por Mes y Año',
                        font: {
                            size: 14
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Congestión Promedio'
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Mes'
                        }
                    }
                }
            }
        });
    }

    createHourlyProfileChart() {
        const ctx = document.getElementById('hourlyProfileChart').getContext('2d');
        this.charts.hourlyProfile = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
                        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
                        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    title: {
                        display: true,
                        text: 'Perfil Horario de Congestión por Tipo de Día',
                        font: {
                            size: 14
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Congestión Promedio'
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hora del Día'
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Verificar que los datos estén disponibles
        if (!this.filteredData || this.filteredData.length === 0) {
            console.warn('No hay datos filtrados para actualizar las gráficas');
            return;
        }

        console.log('Actualizando gráficas con', this.filteredData.length, 'registros filtrados');
        
        try {
            this.updateTimeSeriesChart();
            this.updateHourlyProfileChart();
            this.updateHistogramChart();
            console.log('Todas las gráficas actualizadas correctamente');
        } catch (error) {
            console.error('Error actualizando gráficas:', error);
        }
    }

    updateTimeSeriesChart() {
        console.log('Actualizando gráfica de serie de tiempo con', this.filteredData.length, 'registros');
        
        // Agrupar datos por año, mes y calcular promedio de congestión
        const monthlyData = {};
        
        this.filteredData.forEach(item => {
            try {
                const year = new Date(item.fecha).getFullYear();
                const month = new Date(item.fecha).getMonth(); // 0-11
                
                if (!monthlyData[year]) {
                    monthlyData[year] = Array(12).fill(0).map(() => ({ sum: 0, count: 0 }));
                }
                
                monthlyData[year][month].sum += item.congestion;
                monthlyData[year][month].count += 1;
            } catch (error) {
                console.error('Error procesando item para gráfica de tiempo:', item, error);
            }
        });
        
        console.log('Datos mensuales agrupados:', monthlyData);

        // Crear datasets para cada año
        const datasets = [];
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        let colorIndex = 0;

        Object.keys(monthlyData).sort().forEach(year => {
            const data = monthlyData[year].map(month => 
                month.count > 0 ? month.sum / month.count : 0
            );

            datasets.push({
                label: `Año ${year}`,
                data: data,
                borderColor: colors[colorIndex % colors.length],
                backgroundColor: colors[colorIndex % colors.length] + '20',
                borderWidth: 3,
                fill: false,
                tension: 0.1
            });
            colorIndex++;
        });

        this.charts.timeSeries.data.datasets = datasets;
        this.charts.timeSeries.update();
    }

    updateHourlyProfileChart() {
        console.log('Actualizando gráfica de perfil horario con', this.filteredData.length, 'registros');
        
        // Agrupar datos por tipo de día, hora y calcular promedio de congestión
        const hourlyData = {};
        const tiposDia = ['Hábil', 'Festivo', 'Sábado'];
        
        tiposDia.forEach(tipo => {
            hourlyData[tipo] = Array(24).fill(0).map(() => ({ sum: 0, count: 0 }));
        });

        this.filteredData.forEach(item => {
            try {
                if (tiposDia.includes(item.tipoDia)) {
                    const hour = parseInt(item.hora.split(':')[0]);
                    if (!isNaN(hour) && hour >= 0 && hour < 24) {
                        hourlyData[item.tipoDia][hour].sum += item.congestion;
                        hourlyData[item.tipoDia][hour].count += 1;
                    }
                }
            } catch (error) {
                console.error('Error procesando item para gráfica horaria:', item, error);
            }
        });
        
        console.log('Datos horarios agrupados:', hourlyData);

        // Crear datasets para cada tipo de día
        const datasets = [];
        const colors = ['#FF6384', '#36A2EB', '#FFCE56'];
        
        tiposDia.forEach((tipo, index) => {
            const data = hourlyData[tipo].map(hour => 
                hour.count > 0 ? hour.sum / hour.count : 0
            );

            datasets.push({
                label: tipo,
                data: data,
                backgroundColor: colors[index] + '80',
                borderColor: colors[index],
                borderWidth: 2
            });
        });

        this.charts.hourlyProfile.data.datasets = datasets;
        this.charts.hourlyProfile.update();
    }

    updateHistogramChart() {
        console.log('Actualizando histograma...');
        if (!this.charts.histogram) {
            console.error('No se encontró el chart del histograma');
            return;
        }
        
        const congestionValues = this.filteredData.map(item => item.congestion);
        console.log('Valores de congestión para histograma:', congestionValues.length);
        if (congestionValues.length === 0) {
            console.warn('No hay datos para mostrar en el histograma');
            return;
        }

        // Calcular estadísticas descriptivas
        const sortedValues = congestionValues.sort((a, b) => a - b);
        const average = sortedValues.reduce((sum, val) => sum + val, 0) / congestionValues.length;
        const median = this.calculatePercentile(sortedValues, 50);
        const percentile25 = this.calculatePercentile(sortedValues, 25);
        const percentile75 = this.calculatePercentile(sortedValues, 75);
        const percentile5 = this.calculatePercentile(sortedValues, 5);
        const percentile95 = this.calculatePercentile(sortedValues, 95);

        // Calcular rangos para el histograma
        const min = Math.min(...congestionValues);
        const max = Math.max(...congestionValues);
        const range = max - min;
        const binCount = 20; // Más barras para mejor resolución
        const binSize = range / binCount;

        // Crear bins
        const bins = Array(binCount).fill(0);
        const labels = [];
        const binCenters = [];

        for (let i = 0; i < binCount; i++) {
            const binStart = min + (i * binSize);
            const binEnd = min + ((i + 1) * binSize);
            const binCenter = (binStart + binEnd) / 2;
            labels.push(`${Math.round(binStart)}-${Math.round(binEnd)}`);
            binCenters.push(binCenter);
        }

        // Contar valores en cada bin
        congestionValues.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
            bins[binIndex]++;
        });

        // Crear dataset principal para el histograma
        const datasets = [
            {
                label: 'Frecuencia',
                data: bins,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }
        ];

        // Agregar líneas verticales para las estadísticas descriptivas
        const maxFreq = Math.max(...bins);
        
        // Encontrar el índice del bin más cercano para cada estadística
        const findBinIndex = (value) => {
            return Math.min(Math.floor((value - min) / binSize), binCount - 1);
        };

        // Línea para el Promedio
        const avgBinIndex = findBinIndex(average);
        datasets.push({
            label: `Promedio: ${average.toFixed(1)}`,
            data: Array(binCount).fill(null).map((_, i) => i === avgBinIndex ? maxFreq : null),
            borderColor: '#FF6384',
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointRadius: 0,
            type: 'line',
            fill: false
        });

        // Línea para la Mediana
        const medianBinIndex = findBinIndex(median);
        datasets.push({
            label: `Mediana: ${median.toFixed(1)}`,
            data: Array(binCount).fill(null).map((_, i) => i === medianBinIndex ? maxFreq : null),
            borderColor: '#36A2EB',
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointRadius: 0,
            type: 'line',
            fill: false
        });

        // Línea para el Percentil 75
        const p75BinIndex = findBinIndex(percentile75);
        datasets.push({
            label: `Percentil 75: ${percentile75.toFixed(1)}`,
            data: Array(binCount).fill(null).map((_, i) => i === p75BinIndex ? maxFreq : null),
            borderColor: '#FFCE56',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            type: 'line',
            fill: false
        });

        // Línea para el Percentil 25
        const p25BinIndex = findBinIndex(percentile25);
        datasets.push({
            label: `Percentil 25: ${percentile25.toFixed(1)}`,
            data: Array(binCount).fill(null).map((_, i) => i === p25BinIndex ? maxFreq : null),
            borderColor: '#4BC0C0',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            type: 'line',
            fill: false
        });

        // Línea para el Percentil 95
        const p95BinIndex = findBinIndex(percentile95);
        datasets.push({
            label: `Percentil 95: ${percentile95.toFixed(1)}`,
            data: Array(binCount).fill(null).map((_, i) => i === p95BinIndex ? maxFreq : null),
            borderColor: '#9966FF',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            type: 'line',
            fill: false
        });

        // Línea para el Percentil 5
        const p5BinIndex = findBinIndex(percentile5);
        datasets.push({
            label: `Percentil 5: ${percentile5.toFixed(1)}`,
            data: Array(binCount).fill(null).map((_, i) => i === p5BinIndex ? maxFreq : null),
            borderColor: '#FF9F40',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            type: 'line',
            fill: false
        });

        // Actualizar gráfica
        console.log('Labels del histograma:', labels);
        console.log('Datasets del histograma:', datasets);
        
        this.charts.histogram.data.labels = labels;
        this.charts.histogram.data.datasets = datasets;
        this.charts.histogram.update();
        
        console.log('Histograma actualizado correctamente');
    }

    createHistogramChart() {
        console.log('Creando histograma...');
        const canvas = document.getElementById('histogramChart');
        if (!canvas) {
            console.error('No se encontró el canvas del histograma');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Contexto del canvas obtenido:', ctx);
        
        this.charts.histogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Frecuencia',
                            font: {
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Rango de Congestión',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        console.log('Histograma creado:', this.charts.histogram);
    }

    calculatePercentile(sortedArray, percentile) {
        const index = (percentile / 100) * (sortedArray.length - 1);
        if (Number.isInteger(index)) {
            return sortedArray[index];
        } else {
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const weight = index - lower;
            return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
        }
    }

    showError(message) {
        const container = document.querySelector('.dashboard');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div style="background: #fed7d7; border: 1px solid #feb2b2; color: #c53030; padding: 20px; border-radius: 10px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <br>${message}
            </div>
        `;
        container.appendChild(errorDiv);
    }

    showMessage(message) {
        const container = document.querySelector('.dashboard');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.innerHTML = `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 10px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <br>${message}
            </div>
        `;
        container.appendChild(messageDiv);
        
        // Remover mensaje después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Inicializar el dashboard cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new CarrilPreferencialDashboard();
});
