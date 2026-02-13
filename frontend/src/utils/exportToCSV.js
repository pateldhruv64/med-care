export const exportToCSV = (data, filename) => {
    if (!data || !data.length) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
