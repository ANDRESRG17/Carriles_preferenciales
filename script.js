class CarrilPreferencialDashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.charts = {};
        
        this.init();
    }

    async init() {
        console.log('Inicializando dashboard...');
        console.log('Verificando datos de muestra antes de iniciar...');
        console.log('window.SAMPLE_DATA existe:', !!window.SAMPLE_DATA);
        console.log('window.SAMPLE_DATA.length:', window.SAMPLE_DATA ? window.SAMPLE_DATA.length : 'undefined');
        
        try {
            this.setupEventListeners();
            await this.loadData();
            this.createCharts();
            this.populateFilters();
            this.updateStats();
            this.updateCharts();
            
            console.log('Dashboard inicializado completamente');
            console.log('Estado final - this.data.length:', this.data.length);
            console.log('Estado final - this.filteredData.length:', this.filteredData.length);
        } catch (error) {
            console.error('Error durante la inicialización:', error);
        }
    }

    async loadData() {
        try {
            console.log('Cargando datos principales del CSV...');
            console.log('Intentando cargar: 20250903_CarrilPreferencial_final.csv');
            
            const response = await fetch('20250903_CarrilPreferencial_final.csv');
            console.log('Respuesta del fetch:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('CSV cargado, longitud:', csvText.length);
            console.log('Primeras 200 caracteres:', csvText.substring(0, 200));
            
            this.data = this.parseCSV(csvText);
            console.log(`Datos parseados: ${this.data.length} registros`);
            
            if (this.data.length > 0) {
                console.log('Primer registro:', this.data[0]);
            }
            
            this.filteredData = [...this.data];
            console.log(`✅ Datos CSV cargados exitosamente: ${this.data.length} registros`);
        } catch (error) {
            console.error('❌ Error cargando datos principales:', error);
            console.log('🔄 Usando datos de muestra como respaldo...');
            this.loadSampleData();
        }
    }

    loadSampleData() {
        try {
            console.log('=== INICIO: Cargando datos de muestra ===');
            console.log('window.SAMPLE_DATA existe:', !!window.SAMPLE_DATA);
            console.log('window.SAMPLE_DATA.length:', window.SAMPLE_DATA ? window.SAMPLE_DATA.length : 'undefined');
            
            if (window.SAMPLE_DATA && window.SAMPLE_DATA.length > 0) {
                this.data = [...window.SAMPLE_DATA];
                this.filteredData = [...this.data];
                console.log(`✅ Datos de muestra cargados exitosamente: ${this.data.length} registros`);
                console.log('📊 Primer registro:', this.data[0]);
                console.log('📊 Último registro:', this.data[this.data.length - 1]);
                console.log('📊 Carriles disponibles:', [...new Set(this.data.map(item => item.carril))]);
                console.log('📊 Tipos de día disponibles:', [...new Set(this.data.map(item => item.tipoDia))]);
                console.log('📊 Sentidos disponibles:', [...new Set(this.data.map(item => item.sentido))]);
                console.log('=== FIN: Datos de muestra cargados ===');
            } else {
                console.error('❌ No se encontraron datos de muestra');
                console.error('window.SAMPLE_DATA:', window.SAMPLE_DATA);
                this.data = [];
                this.filteredData = [];
            }
        } catch (error) {
            console.error('❌ Error cargando datos de muestra:', error);
            this.data = [];
            this.filteredData = [];
        }
    }

    parseCSV(csvText) {
        console.log('=== INICIO: Parseando CSV ===');
        console.log('Texto CSV recibido, longitud:', csvText.length);
        
        const lines = csvText.trim().split('\n');
        console.log('Total de líneas en el CSV:', lines.length);
        
        if (lines.length === 0) {
            console.error('❌ CSV vacío o sin líneas');
            return [];
        }
        
        // Mostrar encabezados
        const headers = lines[0].split(',');
        console.log('📋 Encabezados del CSV:', headers);
        console.log('📋 Número de columnas:', headers.length);
        
        const dataLines = lines.slice(1).filter(line => line.trim() !== '');
        console.log('📊 Líneas de datos (sin encabezado):', dataLines.length);
        
        if (dataLines.length === 0) {
            console.error('❌ No hay líneas de datos en el CSV');
            return [];
        }
        
        // Mostrar primeras líneas para debug
        if (dataLines.length > 0) {
            console.log('📋 Primera línea de datos:', dataLines[0]);
            console.log('📋 Valores de la primera línea:', dataLines[0].split(','));
        }
        
        let processedCount = 0;
        let errorCount = 0;
        
        const parsedData = dataLines.map((line, index) => {
            try {
                const values = line.split(',');
                
                // Solo mostrar logs para las primeras 5 líneas para no saturar la consola
                if (index < 5) {
                    console.log(`📊 Línea ${index + 1}: ${values.length} valores`);
                }
                
                if (values.length < 11) {
                    if (index < 10) { // Solo mostrar primeros 10 errores
                        console.log(`⚠️ Línea ${index + 1} tiene menos de 11 valores:`, values.length);
                    }
                    errorCount++;
                    return null;
                }
                
                const congestion = parseFloat(values[10]);
                if (isNaN(congestion)) {
                    if (index < 10) { // Solo mostrar primeros 10 errores
                        console.log(`⚠️ Línea ${index + 1} tiene congestión inválida:`, values[10]);
                    }
                    errorCount++;
                    return null;
                }
                
                const item = {
                    fecha: values[0],           // date
                    hora: values[1],            // hour
                    semana: values[2],          // semana_del_año
                    dia: values[3],             // nombre_dia
                    mes: values[4],             // Mes
                    tipoDia: values[5],         // Día_tipo
                    carril: values[6],          // Name
                    sentido: values[7],         // sentido
                    desde: values[8],           // desde
                    hasta: values[9],           // hasta
                    congestion: congestion      // Congestión
                };
                
                if (index < 3) {
                    console.log(`✅ Item ${index + 1} parseado:`, item);
                }
                
                processedCount++;
                return item;
            } catch (error) {
                if (index < 10) { // Solo mostrar primeros 10 errores
                    console.error(`❌ Error procesando línea ${index + 1}:`, error);
                }
                errorCount++;
                return null;
            }
        }).filter(item => item !== null);
        
        console.log('=== RESUMEN DEL PARSEO ===');
        console.log(`✅ Líneas procesadas exitosamente: ${processedCount}`);
        console.log(`❌ Líneas con errores: ${errorCount}`);
        console.log(`📊 Total de items válidos: ${parsedData.length}`);
        console.log('=== FIN: CSV parseado ===');
        
        return parsedData;
    }

    setupEventListeners() {
        document.getElementById('yearFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFromFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateToFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dayFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dayTypeFilter').addEventListener('change', () => this.applyFilters());
        
        document.getElementById('carrilFilter').addEventListener('change', () => {
            this.updateDependentFilters();
            this.applyFilters();
        });
        
        document.getElementById('desdeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('hastaFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sentidoFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('hourFilter').addEventListener('change', () => this.applyFilters());
        
        document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
        document.getElementById('reloadCSV').addEventListener('click', () => this.reloadCSVData());
    }

    populateFilters() {
        console.log('=== INICIO: Poblando filtros ===');
        console.log('this.data existe:', !!this.data);
        console.log('this.data.length:', this.data ? this.data.length : 'undefined');
        
        if (!this.data || this.data.length === 0) {
            console.log('❌ No hay datos para poblar filtros');
            return;
        }

        console.log('✅ Poblando filtros con', this.data.length, 'registros');
        this.clearFilters();

        // Años
        const years = [...new Set(this.data.map(item => {
            try {
                return new Date(item.fecha).getFullYear();
            } catch (error) {
                return null;
            }
        }))].filter(year => year !== null).sort();
        
        const yearFilter = document.getElementById('yearFilter');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Carriles
        const carriles = [...new Set(this.data.map(item => item.carril))].filter(c => c && c.trim() !== '').sort();
        const carrilFilter = document.getElementById('carrilFilter');
        carriles.forEach(carril => {
            const option = document.createElement('option');
            option.value = carril;
            option.textContent = carril;
            carrilFilter.appendChild(option);
        });

        // Puntos desde
        const desdePuntos = [...new Set(this.data.map(item => item.desde))].filter(d => d && d.trim() !== '').sort();
        const desdeFilter = document.getElementById('desdeFilter');
        desdePuntos.forEach(punto => {
            const option = document.createElement('option');
            option.value = punto;
            option.textContent = punto;
            desdeFilter.appendChild(option);
        });

        // Puntos hasta
        const hastaPuntos = [...new Set(this.data.map(item => item.hasta))].filter(h => h && h.trim() !== '').sort();
        const hastaFilter = document.getElementById('hastaFilter');
        hastaPuntos.forEach(punto => {
            const option = document.createElement('option');
            option.value = punto;
            option.textContent = punto;
            hastaFilter.appendChild(option);
        });

        // Sentidos
        const sentidos = [...new Set(this.data.map(item => item.sentido))].filter(s => s && s.trim() !== '').sort();
        const sentidoFilter = document.getElementById('sentidoFilter');
        sentidos.forEach(sentido => {
            const option = document.createElement('option');
            option.value = sentido;
            option.textContent = sentido;
            sentidoFilter.appendChild(option);
        });
        
        console.log('✅ Filtros poblados exitosamente:');
        console.log('   - Años:', years);
        console.log('   - Carriles:', carriles);
        console.log('   - Desde:', desdePuntos);
        console.log('   - Hasta:', hastaPuntos);
        console.log('   - Sentidos:', sentidos);
        console.log('=== FIN: Filtros poblados ===');
    }

    updateDependentFilters() {
        const carrilSeleccionado = document.getElementById('carrilFilter').value;
        
        if (carrilSeleccionado) {
            const datosCarril = this.data.filter(item => item.carril === carrilSeleccionado);
            
            const desdePuntos = [...new Set(datosCarril.map(item => item.desde))].filter(d => d && d.trim() !== '').sort();
            this.updateFilterOptions('desdeFilter', desdePuntos, 'Todos los puntos');
            
            const hastaPuntos = [...new Set(datosCarril.map(item => item.hasta))].filter(h => h && h.trim() !== '').sort();
            this.updateFilterOptions('hastaFilter', hastaPuntos, 'Todos los puntos');
            
            const sentidos = [...new Set(datosCarril.map(item => item.sentido))].filter(s => s && s.trim() !== '').sort();
            this.updateFilterOptions('sentidoFilter', sentidos, 'Todos los sentidos');
        } else {
            this.populateFilters();
        }
    }

    updateFilterOptions(filterId, options, defaultText) {
        const filter = document.getElementById(filterId);
        if (!filter) return;
        
        const currentValue = filter.value;
        filter.innerHTML = `<option value="">${defaultText}</option>`;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            filter.appendChild(optionElement);
        });
        
        if (currentValue && options.includes(currentValue)) {
            filter.value = currentValue;
        }
    }

    clearFilters() {
        document.getElementById('yearFilter').innerHTML = '<option value="">Todos los años</option>';
        document.getElementById('carrilFilter').innerHTML = '<option value="">Todos los carriles</option>';
        document.getElementById('desdeFilter').innerHTML = '<option value="">Todos los puntos</option>';
        document.getElementById('hastaFilter').innerHTML = '<option value="">Todos los puntos</option>';
        document.getElementById('sentidoFilter').innerHTML = '<option value="">Todos los sentidos</option>';
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
            try {
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
            } catch (error) {
                return false;
            }
        });

        this.updateDependentFilters();
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
        
        this.populateFilters();
        this.filteredData = [...this.data];
        this.updateStats();
        this.updateCharts();
    }

    async reloadCSVData() {
        console.log('🔄 Recargando datos del CSV...');
        try {
            await this.loadData();
            this.populateFilters();
            this.updateStats();
            this.updateCharts();
            console.log('✅ CSV recargado exitosamente');
        } catch (error) {
            console.error('❌ Error recargando CSV:', error);
        }
    }

    updateStats() {
        if (!this.filteredData || this.filteredData.length === 0) return;
        console.log('Estadísticas actualizadas en el histograma con', this.filteredData.length, 'registros');
    }

    createCharts() {
        try {
            this.createTimeSeriesChart();
            this.createHourlyProfileChart();
            this.createHistogramChart();
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
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: 'Evolución de la Congestión por Mes y Año'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Congestión Promedio' }
                    },
                    x: { title: { display: true, text: 'Mes' } }
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
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: 'Perfil Horario de Congestión por Tipo de Día'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Congestión Promedio' }
                    },
                    x: { title: { display: true, text: 'Hora del Día' } }
                }
            }
        });
    }

    createHistogramChart() {
        const canvas = document.getElementById('histogramChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        this.charts.histogram = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Frecuencia' }
                    },
                    x: { title: { display: true, text: 'Rango de Congestión' } }
                }
            }
        });
    }

    updateCharts() {
        if (!this.filteredData || this.filteredData.length === 0) return;
        
        try {
            this.updateTimeSeriesChart();
            this.updateHourlyProfileChart();
            this.updateHistogramChart();
        } catch (error) {
            console.error('Error actualizando gráficas:', error);
        }
    }

    updateTimeSeriesChart() {
        const monthlyData = {};
        
        this.filteredData.forEach(item => {
            try {
                const year = new Date(item.fecha).getFullYear();
                const month = new Date(item.fecha).getMonth();
                
                if (!monthlyData[year]) {
                    monthlyData[year] = Array(12).fill(0).map(() => ({ sum: 0, count: 0 }));
                }
                
                monthlyData[year][month].sum += item.congestion;
                monthlyData[year][month].count += 1;
            } catch (error) {
                console.error('Error procesando item para gráfica de tiempo:', item, error);
            }
        });

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
        if (!this.charts.histogram) return;
        
        const congestionValues = this.filteredData.map(item => item.congestion);
        if (congestionValues.length === 0) return;

        const sortedValues = congestionValues.sort((a, b) => a - b);
        const average = sortedValues.reduce((sum, val) => sum + val, 0) / congestionValues.length;
        const median = this.calculatePercentile(sortedValues, 50);
        const percentile25 = this.calculatePercentile(sortedValues, 25);
        const percentile75 = this.calculatePercentile(sortedValues, 75);
        const percentile5 = this.calculatePercentile(sortedValues, 5);
        const percentile95 = this.calculatePercentile(sortedValues, 95);

        const min = Math.min(...congestionValues);
        const max = Math.max(...congestionValues);
        const range = max - min;
        const binCount = 20;
        const binSize = range / binCount;

        const bins = Array(binCount).fill(0);
        const labels = [];

        for (let i = 0; i < binCount; i++) {
            const binStart = min + (i * binSize);
            const binEnd = min + ((i + 1) * binSize);
            labels.push(`${Math.round(binStart)}-${Math.round(binEnd)}`);
        }

        congestionValues.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
            bins[binIndex]++;
        });

        const datasets = [
            {
                label: 'Frecuencia',
                data: bins,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }
        ];

        const maxFreq = Math.max(...bins);
        const findBinIndex = (value) => {
            return Math.min(Math.floor((value - min) / binSize), binCount - 1);
        };

        // Agregar líneas para estadísticas
        const stats = [
            { value: average, label: `Promedio: ${average.toFixed(1)}`, color: '#FF6384' },
            { value: median, label: `Mediana: ${median.toFixed(1)}`, color: '#36A2EB' },
            { value: percentile75, label: `Percentil 75: ${percentile75.toFixed(1)}`, color: '#FFCE56' },
            { value: percentile25, label: `Percentil 25: ${percentile25.toFixed(1)}`, color: '#4BC0C0' },
            { value: percentile95, label: `Percentil 95: ${percentile95.toFixed(1)}`, color: '#9966FF' },
            { value: percentile5, label: `Percentil 5: ${percentile5.toFixed(1)}`, color: '#FF9F40' }
        ];

        stats.forEach(stat => {
            const binIndex = findBinIndex(stat.value);
            datasets.push({
                label: stat.label,
                data: Array(binCount).fill(null).map((_, i) => i === binIndex ? maxFreq : null),
                borderColor: stat.color,
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointRadius: 0,
                type: 'line',
                fill: false
            });
        });

        this.charts.histogram.data.labels = labels;
        this.charts.histogram.data.datasets = datasets;
        this.charts.histogram.update();
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


}

document.addEventListener('DOMContentLoaded', () => {
    new CarrilPreferencialDashboard();
});
