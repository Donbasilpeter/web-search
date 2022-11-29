import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

function DownloadSourcesCsv({ collectionId }) {
  const handleDownloadRequest = () => {
    window.location = `/api/sources/sources/download_csv/?collection_id=${collectionId}`;
  };
  return (

    <Button variant="outlined" onClick={() => handleDownloadRequest()}>
      Download Source CSV
    </Button>
  );
}

DownloadSourcesCsv.propTypes = {
  collectionId: PropTypes.number.isRequired,
};
export default DownloadSourcesCsv;