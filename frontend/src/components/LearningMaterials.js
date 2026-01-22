import React, { useState, useEffect } from 'react';
import './LearningMaterials.css';
import api from '../utils/api';

function LearningMaterials() {
  const [learningData, setLearningData] = useState([]);
  const [learningLoading, setLearningLoading] = useState(true);

  useEffect(() => {
    fetchLearningMaterials();
  }, []);

  const fetchLearningMaterials = async () => {
    setLearningLoading(true);
    try {
      const response = await api.get('/learning/materials');
      if (response.data.success) {
        setLearningData(response.data.materials || []);
        console.log('✅ Learning materials loaded:', response.data.materials);
      }
    } catch (error) {
      console.error('❌ Error fetching learning materials:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLearningData([]);
    } finally {
      setLearningLoading(false);
    }
  };

  const handleBack = () => {
    // Smart URL detection for both dev and prod environments
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Development: use relative path that will hit backend on port 8080
      window.location.href = '/employee/welcome';
    } else {
      // Production (Azure): use relative path on same domain
      window.location.href = '/employee/welcome';
    }
  };

  return (
    <div className="learning-page">
      {/* Header */}
      <div className="learning-header">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <h1>📚 Learning Materials</h1>
        <p>Explore our comprehensive training resources</p>
      </div>

      {/* Content */}
      <div className="learning-container">
        {learningLoading ? (
          <div className="loading-state">
            <p>Loading learning materials...</p>
          </div>
        ) : learningData.length > 0 ? (
          <div className="materials-grid">
            {learningData.map((material, fileIndex) =>
              material.data && material.data.length > 0 ? (
                <div key={fileIndex} className="material-card">
                  {/* Card Header */}
                  <div className="material-header">
                    <div className="material-info">
                      <h2>📁 {material.fileName}</h2>
                      <p className="material-meta">
                        <span className="level-badge" data-level={material.level.toLowerCase()}>
                          {material.level}
                        </span>
                        <span className="row-count">{material.rowCount} topics</span>
                      </p>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="table-wrapper">
                    <table className="material-table">
                      <thead>
                        <tr>
                          {Object.keys(material.data[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {material.data.map((row, rowIndex) => {
                          let moduleValue = row[Object.keys(material.data[0])[0]];
                          if (!moduleValue || String(moduleValue).trim() === '') {
                            for (let i = rowIndex - 1; i >= 0; i--) {
                              const prevModule = material.data[i][Object.keys(material.data[0])[0]];
                              if (prevModule && String(prevModule).trim() !== '') {
                                moduleValue = prevModule;
                                break;
                              }
                            }
                          }

                          return (
                            <tr
                              key={rowIndex}
                              className={String(row[Object.keys(material.data[0])[0]] || '').trim() !== '' ? 'header-row' : ''}
                            >
                              {Object.keys(material.data[0]).map((key, colIndex) => {
                                const value = row[key];
                                const isEmpty = !value || String(value).trim() === '';

                                return (
                                  <td
                                    key={key}
                                    className={isEmpty ? 'empty-cell' : colIndex === 0 ? 'module-cell' : ''}
                                  >
                                    {typeof value === 'string' && value.includes('http') ? (
                                      <a
                                        href={value.split('\r\n')[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link-cell"
                                      >
                                        🔗 Open Link
                                      </a>
                                    ) : isEmpty ? (
                                      '—'
                                    ) : (
                                      String(value).trim()
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null
            )}

            {/* Empty files info */}
            {learningData.filter((m) => !m.data || m.data.length === 0).length > 0 && (
              <div className="empty-files-info">
                <p>
                  ℹ️ Note:{' '}
                  {learningData
                    .filter((m) => !m.data || m.data.length === 0)
                    .map((m) => m.fileName)
                    .join(', ')}{' '}
                  {learningData.filter((m) => !m.data || m.data.length === 0).length === 1
                    ? 'has'
                    : 'have'}{' '}
                  no data available yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>No learning materials available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningMaterials;
