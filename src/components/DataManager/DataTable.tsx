import React, { useState } from 'react';
import { Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import ViewDataModal from './ViewDataModal';
import EditDataModal from './EditDataModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface DataTableProps {
  type: string;
  data: any[];
  searchTerm: string;
}

const DataTable: React.FC<DataTableProps> = ({ type, data, searchTerm }) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [viewItem, setViewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const getColumns = (type: string) => {
    const columnMap = {
      departments: [
        { key: 'name', label: 'Department Name' },
        { key: 'code', label: 'Code' },
        { key: 'head', label: 'Head of Department' },
        { key: 'facultyCount', label: 'Faculty Count' },
        { key: 'studentCount', label: 'Students' }
      ],
      courses: [
        { key: 'code', label: 'Course Code' },
        { key: 'name', label: 'Course Name' },
        { key: 'department', label: 'Department' },
        { key: 'credits', label: 'Credits' },
        { key: 'type', label: 'Type' },
        { key: 'duration', label: 'Duration (mins)' }
      ],
      faculty: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'department', label: 'Department' },
        { key: 'maxLoad', label: 'Max Weekly Load' },
        { key: 'courses', label: 'Assigned Courses' }
      ],
      rooms: [
        { key: 'name', label: 'Room Name' },
        { key: 'type', label: 'Type' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'building', label: 'Building' },
        { key: 'equipment', label: 'Equipment' }
      ],
      batches: [
        { key: 'name', label: 'Batch Name' },
        { key: 'program', label: 'Program' },
        { key: 'year', label: 'Year' },
        { key: 'department', label: 'Department' },
        { key: 'studentCount', label: 'Students' }
      ]
    };
    return columnMap[type as keyof typeof columnMap] || [];
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = getColumns(type);

  const toggleRowSelection = (index: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((_, index) => index)));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                onChange={toggleAllRows}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedRows.has(index)}
                  onChange={() => toggleRowSelection(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Array.isArray(item[column.key]) 
                    ? item[column.key].join(', ')
                    : item[column.key]?.toString() || '-'
                  }
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-3">
                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    title="View Details"
                    onClick={() => setViewItem(item)}
                    <Eye className="h-4 w-4" />
                    onClick={() => setEditItem(item)}
                  </button>
                    title="Edit"
                  <button className="text-emerald-600 hover:text-emerald-800 transition-colors">
                    <Edit className="h-4 w-4" />
                    onClick={() => setDeleteItem(item)}
                  </button>
                    title="Delete"
                  <button className="text-red-600 hover:text-red-800 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No {type} found matching your search criteria.</p>
        </div>
      )}
      
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
          <p className="text-sm text-blue-700">
            {selectedRows.size} item{selectedRows.size > 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {/* Modals */}
      {viewItem && (
        <ViewDataModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          item={viewItem}
          type={type}
        />
      )}

      {editItem && (
        <EditDataModal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          item={editItem}
          type={type}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          item={deleteItem}
          type={type}
          onConfirm={() => {
            console.log(`Deleting ${type}:`, deleteItem);
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default DataTable;