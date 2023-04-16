/**
 * Find a table by id.  The ID is the content of the first header column.  It
 * returns an array of all tables which match this ID.
 */
const findTablesById = tableId => {

    // Go through all our rows
    return [...document.getElementsByTagName("tr")].filter(tr => {

        // We're only looking at the first row
        if (tr.previousElementSibling !== null) {
            return false;
        }

        // Skip tables with no columns
        const columns = [...tr.children];
        if (columns.length === 0) {
            return false;
        }

        // We only care about header cells
        if (columns[0].nodeName !== "TH") {
            return false;
        }

        // Ignore it if the cell content doesn't match
        if (columns[0].textContent !== tableId) {
            return false;
        }

        return true;
    }).map(elem => {

        while (elem.nodeName !== "TABLE") {

            elem = elem.parentNode;
        }

        return elem;
    });
};

/**
 * A utility function to add an additional row of headers to a table, which
 * groups the current row of headers
 *
 * This takes two parameters.  The first is the identifier for the table, which
 * is expected to be the text in the first header column of the table.  The
 * second is an array of the column groupings.  Each element of the array is an
 * object with the title of the grouping as the key, and the number of columns
 * this heading spans as the value.
 */
const tableGroupColumns = (tableId, headingGroups) => {

    // First, find the table(s) to modify
    const matches = [...document.getElementsByTagName("tr")].filter(tr => {

        const columns = [...tr.children];

        if (columns.length === 0) {
            return false;
        }

        if (columns[0].nodeName !== "TH") {
            return false;
        }

        if (columns[0].textContent !== tableId) {
            return false;
        }

        return true;
    }).map(elem => {

        while (elem.nodeName !== "THEAD") {

            elem = elem.parentNode;
        }

        return elem;
    });

    // Now apply the grouping to each match
    matches.forEach(thead => {

        // Get the original heading row
        const originalTr = thead.getElementsByTagName("tr")[0];

        // Get the data rows too
        const dataRows = [...thead.nextElementSibling.children];

        // Add in 'end of column group' markers in the original heading row and
        // the data rows
        headingGroups.reduce((total, heading) => {

            // Work out which column we are at
            const span = Object.values(heading)[0];
            total = total + span;

            // Add the marker to the heading row
            [...originalTr.children][total - 1].classList.add("end-of-group");

            // And to the data rows
            dataRows.forEach(dataTr => {

                [...dataTr.children][total - 1].classList.add("end-of-group");
            });

            return total;
        }, 0);

        // Create the row
        //
        // We run a reduce() across the heading groups, with the row as the
        // result we carry through.  However, because we also want to know what
        // column we are on, we need to carry that through too.
        const newTr = headingGroups.reduce(([ tr, count ], headingGroup) => {

            // Break down the details of the heading group
            const label = Object.keys(headingGroup)[0];
            const span = headingGroup[label];
            count = count + span;

            // Create a <th> ... </th> for it
            const th = document.createElement("th");
            th.setAttribute("colspan", span);

            // If the label is an underscore, grab the corresponding label from
            // the original row
            if (label === "_") {

                const originalTh = [...originalTr.children][count - 1];
                th.textContent = originalTh.textContent;
                th.setAttribute("rowspan", 2);
                originalTh.style.display = "none";

            // Otherwise set the heading content to be the label
            } else {

                th.textContent = label;
            }

            // Add the heading to the row
            tr.appendChild(th);

            return [ tr, count ];
        }, [ document.createElement("tr"), 0 ])[0];

        // Add the row into the heading block
        thead.prepend(newTr);
    });
};

/**
 * Add a calculation to column (or cell)
 *
 * Parameters are the table to add the calculation to, the number of the column
 * (indexed from 0) to apply the calculation to, and the function to perform
 * the calculation
 *
 * If a row number is passed in, only apply the formula to that row (i.e. it is
 * restricted to a specific cell).  If row number is negative, it is counted
 * from the bottom of the table instead of the top.
 */
const addFormula = (fn, tableId, columnNumber, rowNumber) => {

    // We may have multiple tables, so handle them all
    findTablesById(tableId).forEach(table => {

        const tbody = table.getElementsByTagName("tbody")[0];

        // If the column number is a string, find the column with that heading
        if (typeof columnNumber === "string") {

            const headingElems = [...table.getElementsByTagName("thead")[0].children.item(0).children];
            const headings = headingElems.map(heading => heading.textContent);
            columnNumber = headings.indexOf(columnNumber);
        }

        // Calculate the row number if it's negative
        if (typeof rowNumber !== "undefined" && typeof rowNumber !== "string" && rowNumber < 0) {

            rowNumber = tbody.children.length + rowNumber;
        }

        // Go through the table applying the calculation
        [...tbody.children].forEach((row, i) => {

            // We may have no row number (in which case we add the formula to
            // every row), a numeric row value (which we just compare to the
            // iteration counter), or a string row value (where we see if it
            // matches the content of the first cell in the row)
            if (typeof rowNumber === "undefined" ||
                (typeof rowNumber === "number" && rowNumber === i) ||
                (typeof rowNumber === "string" && rowNumber === row.children.item(0).textContent)) {

                // Extract the data from the table (have to do this inside the loop, so
                // that we get any updated values from previous rows)
                const data = [...tbody.children].map(row => {

                    return [...row.children].map(cell => {

                        return cell.textContent;
                    });;
                });

                // Add a class to the cell to indicate a calculation
                const cell = [...row.children][columnNumber];
                cell.classList.add("calculation");

                // Run the calculation
                cell.textContent = fn(i, columnNumber, data);
            }
        });
    });
};

/**
 * Insulate our observer function from the internals of MutationObserver
 *
 * We want our function to just receive the cell it has been defined for, so
 * this function will take care of traversing the mutations list, etc
 */
const handleMutation = fn => {

    return mutationsList => {

        mutationsList.forEach(mutation => {

            fn (mutation.target);
        });
    };
};

/**
 * Add a listener to a cell (or column)
 *
 * As with the formula, passing just a column adds it to each column, whereas
 * including a row only adds it to that row
 */
const addObserver = (fn, tableId, columnNumber, rowNumber) => {

    // Same wrapper as addFormula() ... think about refactoring
    findTablesById(tableId).forEach(table => {

        const tbody = table.getElementsByTagName("tbody")[0];

        if (typeof rowNumber !== "undefined" && rowNumber < 0) {
            rowNumber = tbody.children.length + rowNumber;
        }

        [...tbody.children].forEach((row, i) => {

            if (typeof rowNumber === "undefined" || rowNumber === i) {

                // Add the observer
                const observer = new MutationObserver(handleMutation(fn));
                observer.observe([...row.children][columnNumber], { childList: true });
            }
        });
    });
};

/**
 * Grab the data from a named table
 */
const getData = tableId => {

    // Assume there is exactly one table with this ID
    const table = findTablesById(tableId)[0];
    if (!table) {
        return null;
    }

    // Also assume it is well-formed with only one <tbody> ... </tbody>
    const tbody = table.getElementsByTagName("tbody")[0];

    // Now grab the data
    return [...tbody.children].map(row => {

        return [...row.children].map(cell => {

            return cell.textContent;
        });;
    });
};

/**
 * Utility function which parses a value as a float, but also treats an empty
 * string as a float
 */
const parseFloatOrBlank = x => {

    if ([ "", "N/A" ].includes(x)) {
        return 0;
    }

    return parseFloat(x);
};

/**
 * Calculate a cumulative total for a column, putting the total in another
 * column.  It takes a parameter which says how many columns the one to be
 * summed is past the one where the result is stored.  If that number is
 * negative, the column to be summed is before the one where the result is
 * stored.
 *
 * For the total, we will treat an empty cell as being zero
 */
const cumulativeTotal = columnDelta => {

    return (row, col, data) => {

        const current =  parseFloatOrBlank(data[row][col + columnDelta]);

        if (row === 0) {
            return current.toFixed(2);
        }

        const total = parseFloatOrBlank(data[row - 1][col]);
        return (total + current).toFixed(2);
    };
};

/**
 * Sum an individual column, by adding all values in the column apart from the
 * current cell.  Treat blanks as zero.
 */
const sumColumn = (row, col, data) => {

    return data.reduce((sum, dataRow, i) => {

        // Don't include the row for the cell doing the calculation
        if (i === row) {
            return sum;
        }

        // Any other row, add to the total
        return sum + parseFloatOrBlank(dataRow[col]);
    }, 0).toFixed(2);
};
