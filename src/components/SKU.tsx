import type { ColDef, GridOptions, ICellRendererParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ✅ Register ag-Grid Community Module
ModuleRegistry.registerModules([AllCommunityModule]);

// ✅ Define the structure of row data
interface IRow {
    id: string;
    label: string;
    class?: string;
    department?: string;
    cost: number;
    price: number;
}

const SKU: React.FC = () => {
    // ✅ State to store table data
    const [rowData, setRowData] = useState<IRow[]>([]);

    // ✅ Reference to ag-Grid
    const gridRef = useRef<AgGridReact<IRow>>(null);

    // ✅ SKU Counter (to ensure unique IDs)
    const skuCounter = useRef(1);

    // ✅ Fetch data from local JSON file (from 'public' folder)
    useEffect(() => {
        fetch("/sku.json")
            .then((response) => response.json())
            .then((data) => setRowData(data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    // ✅ Function to delete a specific row
    const handleDeleteRow = useCallback((id: string) => {
        setRowData((prevData) => prevData.filter((row) => row.id !== id));
    }, []);

    // ✅ Function to create new row data with unique ID
    const createNewRowData = (): IRow => {
        skuCounter.current += 1;
        return {
            id: `SK${skuCounter.current}`, // Unique SKU ID
            label: `SKU Name ${skuCounter.current}`, // Sample SKU name
            cost: skuCounter.current * 5, // Sample cost calculation
            price: skuCounter.current * 7, // Sample price calculation
        };
    };

    // ✅ Function to add a new row (adds it to the top)
    const addItems = useCallback(() => {
        const newItem = createNewRowData();
        setRowData((prevData) => [newItem, ...prevData]); // Adds new row at the top
    }, []);

    // ✅ Column Definitions for ag-Grid
    const colDefs: ColDef<IRow>[] = [
        {
            maxWidth: 60,
            cellRenderer: (params: ICellRendererParams<IRow>) => (
                <button
                    onClick={() => handleDeleteRow(params.data!.id)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                >
                    🗑
                </button>
            ),
            resizable: true
        },
        { field: "label", headerName: "SKU", maxWidth: 250 },
        { field: "price", headerName: "Price", maxWidth: 125, valueFormatter: (params) => `$${params.value.toLocaleString()}` },
        { field: "cost", headerName: "Cost", maxWidth: 125, valueFormatter: (params) => `$${params.value.toLocaleString()}` },
    ];

    return (
        <div style={{ width: "100%", height: "75%" }}>
            <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={{ flex: 1 }}
                rowSelection="single"
            />

            {/* ✅ Button to add a new SKU */}
            <button className="gs-new-store-btn" onClick={addItems}>NEW SKU</button>
        </div>
    );
};

export default SKU;
