import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './LocationDisplay.css';

export const LocationDisplay = ({ locations }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const list = Array.isArray(locations)
    ? locations
    : typeof locations === 'string'
      ? locations
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  if (list.length === 0) {
    return <span>Location not specified</span>;
  }

  const modal = isOpen
    ? createPortal(
        <div
          className="loc-modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="loc-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="loc-modal-header">
              <h3>All Locations</h3>

              <button
                type="button"
                className="loc-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="loc-modal-body">
              {list.map((loc, i) => (
                <span key={`${loc}-${i}`} className="loc-chip">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <span className="loc-wrap">
        {list.slice(0, 3).join(', ')}

        {list.length > 3 && (
          <span
            className="loc-more"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            {' '}+{list.length - 3} more
          </span>
        )}
      </span>

      {modal}
    </>
  );
};