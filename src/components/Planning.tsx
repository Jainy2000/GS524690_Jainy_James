import { AllCommunityModule, ColDef, ModuleRegistry, ColGroupDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import "../styles/planning.css"

// ✅ Registering the required AG Grid modules

ModuleRegistry.registerModules([AllCommunityModule]);

// ✅ Google Sheet details
const GOOGLE_SHEET_ID = "1EgMU8-gBeUs5j898IZAHI4WOdXe-ewRw";
const SHEET_GID = "1026939898";

// ✅ Defining the structure of row data
interface RowData {
    store: string;
    sku: string;
    price?: number;
    cost?: number;
    [key: string]: string | number | undefined;
}

const MyComponent: React.FC = () => {

    // ✅ State to store row data for the grid
    const [rowData, setRowData] = useState<RowData[]>([]);

    // ✅ State to store column definitions for the grid
    const [colDefs, setColDefs] = useState<(ColDef<RowData> | ColGroupDef<RowData>)[]>([]);

    useEffect(() => {
        // ✅ Function to fetch price or cost for a given SKU ID
        const getValueById = async (id: string, option: "cost" | "price") => {
            try {
                const response = await fetch("/sku.json");
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const jsonData = await response.json();
                const item = jsonData.find((entry: any) => entry.id === id);

                return item ? item[option] : 0;  // ✅ Returns the requested value or default to 0
            } catch (error) {
                console.error("Error fetching cost:", error);
                return 0;
            }
        };

        // ✅ Function to calculate sales dollars based on units sold
        const calculateSalesDollars = async (newUnits: number, id: string) => {
            const price = await getValueById(id, "price");
            return (newUnits * price).toFixed(2);
        };

        // ✅ Function to update calculated fields when "Sales Units" change
        const updateCalculatedFields = async (params: any, week: string) => {
            const newUnits = parseFloat(params.newValue);
            console.log(newUnits)
            if (isNaN(newUnits)) return; // ✅ Prevents invalid calculations for non-numeric input

            const skuId = params.data.sku;
            console.log(skuId)

            // ✅ Calculate sales dollars, GM dollars, and GM percentage
            const newSalesDollars = await calculateSalesDollars(newUnits, skuId);
            console.log(newSalesDollars)
            const newGMDollars = await calculateGMDollars(newUnits, skuId);
            console.log(newGMDollars)
            const newGMPercent = calculateGMPercent(newSalesDollars, newGMDollars);
            console.log(newGMPercent)

            // ✅ Update state with new calculated values
            setRowData((prevRowData) => {
                console.log(prevRowData)
                return prevRowData.map((row) => {
                    if (row.store === params.data.store && row.sku === skuId) {
                        return {
                            ...row,
                            [`${week}_sales_units`]: newUnits,
                            [`${week}_sales_dollars`]: newSalesDollars,
                            [`${week}_gm_dollars`]: newGMDollars,
                            [`${week}_gm_percent`]: newGMPercent,
                        };
                    }
                    return row;
                });
            });
        };

        // ✅ Function to calculate GM (Gross Margin) Dollars
        const calculateGMDollars = async (units: number, id: string) => {
            const price = await getValueById(id, "price");
            const cost = await getValueById(id, "cost");
            return (units * price - units * cost).toFixed(2);
        };

        // ✅ Function to calculate GM % (Gross Margin Percentage)
        const calculateGMPercent = (salesDollars: string, gmDollars: string) => {
            console.log(salesDollars)
            console.log(gmDollars)
            const sales = parseFloat(salesDollars);
            const gm = parseFloat(gmDollars);
            return sales !== 0 ? ((gm / sales) * 100).toFixed(2) : "0";
        };

        // ✅ Function to fetch calendar data and generate column definitions
        const fetchCalendarData = async () => {
            try {
                const response = await fetch("/calendar.json");
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const calendarData = await response.json();
                if (!Array.isArray(calendarData)) throw new Error("Invalid JSON structure");

                const monthGroups: ColGroupDef<RowData>[] = [];
                const monthMap = new Map<string, ColGroupDef<RowData>[]>();

                // ✅ Loop through calendar data and structure columns accordingly
                calendarData.forEach((item: any) => {
                    if (!monthMap.has(item.month_label)) {
                        monthMap.set(item.month_label, []);
                    }

                    const weekGroup: ColGroupDef<RowData> = {
                        headerName: item.week_label,
                        headerClass: "header-center",
                        children: [
                            { field: `${item.week}_sales_units`, headerClass: "header-center", headerName: "Sales Units", minWidth: 120, editable: true, onCellValueChanged: (params) => updateCalculatedFields(params, item.week), },
                            { field: `${item.week}_sales_dollars`, headerClass: "header-center", headerName: "Sales Dollars", minWidth: 120 },
                            { field: `${item.week}_gm_dollars`, headerClass: "header-center", headerName: "GM Dollars", minWidth: 120 },
                            { field: `${item.week}_gm_percent`, headerClass: "header-center", headerName: "GM %", minWidth: 120, cellStyle: formatGMCell },
                        ],
                    };

                    monthMap.get(item.month_label)!.push(weekGroup);
                });

                monthMap.forEach((weeks, month) => {
                    monthGroups.push({
                        headerName: month,
                        children: weeks,
                    });
                });

                // ✅ Set column definitions for the grid
                setColDefs([
                    { field: "store", headerName: "Store", pinned: "left", sortable: true },
                    { field: "sku", headerName: "SKU", pinned: "left", sortable: true },
                    ...monthGroups,
                ]);
            } catch (error) {
                console.error("Error loading calendar.json:", error);
            }
        };

        // ✅ Function to fetch Google Sheets data
        const fetchSheetData = async () => {
            try {
                const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const text = await response.text();
                const jsonText = text.substring(47, text.length - 2);
                const jsonData = JSON.parse(jsonText);

                if (!jsonData.table || !jsonData.table.cols || !jsonData.table.rows) {
                    throw new Error("Invalid Google Sheets response");
                }

                const headers: string[] = jsonData.table.cols.map((col: { label: string }) => col.label || "");

                // ✅ Extract relevant column indexes
                const storeIndex = headers.indexOf("Store");
                const skuIndex = headers.indexOf("SKU");
                const weekIndex = headers.indexOf("Week");
                const salesUnitsIndex = headers.indexOf("Sales Units");
                const salesDollarsIndex = headers.indexOf("Sales Dollars");
                const gmDollarsIndex = headers.indexOf("GM Dollars");
                const gmPercentIndex = headers.indexOf("GM %");

                if (storeIndex === -1 || skuIndex === -1 || weekIndex === -1) {
                    throw new Error("Required columns not found in Google Sheets data.");
                }

                const rowMap = new Map<string, RowData>();

                jsonData.table.rows.forEach((row: { c: { v?: string | number }[] }) => {
                    const store = row.c[storeIndex]?.v?.toString() || "";
                    const sku = row.c[skuIndex]?.v?.toString() || "";
                    const week = row.c[weekIndex]?.v?.toString() || "";

                    const key = `${store}_${sku}`;

                    if (!rowMap.has(key)) {
                        rowMap.set(key, {
                            store,
                            sku,
                        });
                    }

                    // ✅ Populate row data from Google Sheets
                    const existingRow = rowMap.get(key)!;

                    // ✅ Pre-populate values from Google Sheets
                    existingRow[`${week}_sales_units`] = row.c[salesUnitsIndex]?.v?.toString() || "0";
                    existingRow[`${week}_sales_dollars`] = row.c[salesDollarsIndex]?.v?.toString() || "0";
                    existingRow[`${week}_gm_dollars`] = row.c[gmDollarsIndex]?.v?.toString() || "0";
                    existingRow[`${week}_gm_percent`] = (row.c[gmPercentIndex]?.v as number * 100)?.toString() || "0";

                    rowMap.set(key, existingRow);
                });

                setRowData(Array.from(rowMap.values()));
            } catch (error) {
                console.error("Error fetching sheet data:", error);
            }
        };

        // ✅ Function to format GM % cell background color
        const formatGMCell = (params: any) => {
            if (params.value !== undefined) {
                // Ensure params.value exists and extract the number correctly
                const value = params.value ? parseFloat(params.value.toString()) : 0;

                if (value >= 40) return { backgroundColor: "green", color: "white" };
                if (value >= 10 && value < 40) return { backgroundColor: "yellow", color: "black" };
                if (value > 5 && value < 10) return { backgroundColor: "orange", color: "white" };
                if (value <= 5) return { backgroundColor: "red", color: "white" };
            }
            else return { backgroundColor: "white", color: "black" };
        };


        fetchCalendarData();
        fetchSheetData();
    }, []);

    return (
        <div style={{ width: "100%", height: "80%" }}>
            <AgGridReact rowData={rowData} columnDefs={colDefs} defaultColDef={{ flex: 1 }} />
        </div>
    );
};

export default MyComponent;
