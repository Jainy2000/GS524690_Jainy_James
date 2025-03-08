import type { ColDef, GridOptions, ICellRendererParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/store.css"

// ✅ Register ag-Grid Community Module
ModuleRegistry.registerModules([AllCommunityModule]);

// ✅ Define row data structure
interface IRow {
    seqno: number;  // Unique sequence number for each row
    id: string;     // Store ID
    label: string;  // Store name
    city: string;   // City name
    state: number;  // State identifier
}

const Store: React.FC = () => {

    // ✅ State to store table data
    const [rowData, setRowData] = useState<IRow[]>([]);

    // ✅ Reference to ag-Grid instance
    const gridRef = useRef<AgGridReact<IRow>>(null);

    // ✅ Fetch store data from local JSON file (from 'public' folder)
    useEffect(() => {
        fetch("/store.json")
            .then((response) => response.json())
            .then((data) => setRowData(data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    // ✅ Function to delete a row by seqno
    const handleDeleteRow = useCallback((seqno: number) => {
        setRowData((prevData) => prevData.filter((row) => row.seqno !== seqno));
    }, []);

    // ✅ Column Definitions for ag-Grid
    const colDefs: ColDef<IRow>[] = [
        {
            maxWidth: 50,
            cellRenderer: (params: ICellRendererParams<IRow>) => (
                <button
                    onClick={() => handleDeleteRow(params.data!.seqno)}
                    style={{
                        background: "none",
                        border: "none",
                        height: "14px",
                        width: "14px",
                        cursor: "pointer",
                    }}
                >
                    🗑
                </button>
            ),
        },
        { field: "seqno", headerName: "S. No.", rowDrag: true, maxWidth: 100 },
        { field: "label", headerName: "Store Name", maxWidth: 275 },
        { field: "city", headerName: "City", maxWidth: 150 },
        { field: "state", headerName: "State", maxWidth: 100 },
    ];

    // ✅ Grid Options (Enable Row Dragging & Animations)
    const gridOptions: GridOptions = {
        rowDragManaged: true,
        animateRows: true,
    };

    // ✅ Unique Counter for New Rows
    const rowCounter = useRef(rowData.length + 1);

    // ✅ Function to create a new row entry
    const createNewRowData = (): IRow => {
        rowCounter.current += 1;
        return {
            seqno: rowCounter.current, // Assign unique sequence number
            id: `store-${rowCounter.current}`,
            label: `Store ${rowCounter.current}`,
            city: `City ${rowCounter.current}`,
            state: rowCounter.current,
        };
    };

    // ✅ Function to add a new row at the top
    const addItems = useCallback(() => {
        const newItem = createNewRowData();
        setRowData((prevData) => [newItem, ...prevData]); // Adds new row at the top
    }, []);

    return (
        <div style={{ width: "100%", height: "75%" }}>

            {/* ✅ ag-Grid Component */}
            <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={{ flex: 1 }}
                rowSelection="single"
                gridOptions={gridOptions}
            />

            {/* ✅ Button to add a new store row */}
            <button className="gs-new-store-btn" onClick={addItems}>NEW STORE</button>
        </div>
    );
};

export default Store;
