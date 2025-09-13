import React, { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import ViewDataModal from './ViewDataModal';
import EditDataModal from './EditDataModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useData } from '../../context/DataContext';

interface DataTableProps {
  type: string;
  data: any[];
  searchTerm: string;
}

const DataTable: React.FC<DataTableProps> = ({ type, data, searchTerm }) => {
  // We need the raw `departments` data to find the parent of a nested item.
  const { departments } = useData();
  
  // State to manage which modals are open and what data they should display
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [viewItem, setViewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  // This function dynamically determines the table columns based on the active tab.
  const getColumns = (type: string) => {
    const columnMap = {
      departments: [
        { key: 'name', label: 'Department Name' },
        { key: 'code', label: 'Code' },
        { key: 'head', label: 'Head of Department' },
      ],
      courses: [
        { key: 'code', label: 'Course Code' },
        { key: 'name', label: 'Course Name' },
        { key: 'department', label: 'Department' },
        { key: 'credits', label: 'Credits' },
      ],
      faculty: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'department', label: 'Department' },
        { key: 'maxLoad', label: 'Max Weekly Load' },
      ],
      rooms: [
        { key: 'name', label: 'Room Name' },
        { key: 'type', label: 'Type' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'building', label: 'Building' },
      ],
      batches: [
        { key: 'name', label: 'Batch Name' },
        { key: 'program', label: 'Program' },
        { key: 'department', label: 'Department' },
        { key: 'studentCount', label: 'Students' },
      ],
    };
    return columnMap[type as keyof typeof columnMap] || [];
  };

  // **THIS IS THE CRITICAL FIX**
  // When an edit button is clicked, this function now finds the necessary
  // parent IDs and attaches them to the item before opening the modal.
  const handleEditClick = (itemToEdit: any) => {
    // For top-level items (departments, rooms), no special logic is needed.
    if (type === 'departments' || type === 'rooms') {
      setEditItem(itemToEdit);
      return;
    }

    // For nested items, we must find their parent department/regulation IDs.
    let itemWithContext = { ...itemToEdit };
    let parentFound = false;

    for (const dept of departments) {
      if (parentFound) break;

      switch (type) {
        case 'courses':
          for (const reg of dept.regulations) {
            for (const sem of reg.semesters) {
              if (sem.courses.some(c => c.id === itemToEdit.id)) {
                itemWithContext.departmentId = dept.id;
                itemWithContext.regulationId = reg.id;
                parentFound = true;
                break;
              }
            }
            if (parentFound) break;
          }
          break;
        case 'faculty':
          if (dept.faculty.some(f => f.id === itemToEdit.id)) {
            itemWithContext.departmentId = dept.id;
            parentFound = true;
          }
          break;
        case 'batches':
          if (dept.batches.some(b => b.id === itemToEdit.id)) {
            itemWithContext.departmentId = dept.id;
            parentFound = true;
          }
          break;
      }
    }
    
    // Now, open the modal with the complete item object, including parent IDs.
    setEditItem(itemWithContext);
  };

  // Filters the data from the active tab based on the search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = getColumns(type);

  const toggleRowSelection = (index: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) { newSelection.delete(index); } else { newSelection.add(index); }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === filteredData.length) { setSelectedRows(new Set()); } 
    else { setSelectedRows(new Set(filteredData.map((_, index) => index))); }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left"><input type="checkbox" checked={selectedRows.size === filteredData.length && filteredData.length > 0} onChange={toggleAllRows} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/></th>
            {columns.map((column) => (<th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{column.label}</th>))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={selectedRows.has(index)} onChange={() => toggleRowSelection(index)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/></td>
              {columns.map((column) => (<td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Array.isArray(item[column.key]) ? item[column.key].join(', ') : item[column.key]?.toString() || '-'}</td>))}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-3">
                  <button onClick={() => setViewItem(item)} className="text-blue-600 hover:text-blue-800 transition-colors" title="View Details"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => handleEditClick(item)} className="text-emerald-600 hover:text-emerald-800 transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteItem(item)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredData.length === 0 && (<div className="text-center py-12"><p className="text-gray-500">No {type} found.</p></div>)}
      
      {/* --- Modals --- */}
      {viewItem && (<ViewDataModal isOpen={!!viewItem} onClose={() => setViewItem(null)} item={viewItem} type={type}/>)}
      {editItem && (<EditDataModal isOpen={!!editItem} onClose={() => setEditItem(null)} item={editItem} type={type}/>)}
      {deleteItem && (<DeleteConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} item={deleteItem} type={type} onConfirm={() => setDeleteItem(null)}/>)}
    </div>
  );
};

export default DataTable;

