import React from 'react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface AdminTableProps<T> {
    data: T[];
    columns: Column<T>[];
    className?: string;
}

export default function AdminTable<T extends Record<string, any>>({ 
    data, 
    columns, 
    className = "" 
}: AdminTableProps<T>) {
    const getValue = (item: T, key: keyof T | string): any => {
        if (typeof key === 'string' && key.includes('.')) {
            // Handle nested properties like 'user.name'
            return key.split('.').reduce((obj, prop) => obj?.[prop], item);
        }
        return item[key as keyof T];
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        {columns.map((column, index) => (
                            <th 
                                key={index} 
                                className={`text-left p-2 ${column.className || ''}`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                            {columns.map((column, colIndex) => (
                                <td 
                                    key={colIndex} 
                                    className={`p-2 ${column.className || ''}`}
                                >
                                    {column.render ? 
                                        column.render(item) : 
                                        getValue(item, column.key)
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 