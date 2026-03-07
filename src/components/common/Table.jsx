import React from "react";

const Table = ({ columns = [], data = [], className = "" }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((column, colIndex) => {
                  const value = row[column.dataIndex];
                  const content = column.render
                    ? column.render(value, row, rowIndex)
                    : value;

                  return (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-gray-900"
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
