import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AddCircleIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircleOutline';
import { Link } from 'react-router-dom';
import { addPreviewSelectedMedia, removePreviewSelectedMedia } from '../querySlice';
import { useGetFeaturedCollectionsQuery } from '../../../../app/services/collectionsApi';

export default function FeaturedCollectionsPicker() {
  const { data, isLoading } = useGetFeaturedCollectionsQuery();
  const dispatch = useDispatch();

  const { previewCollections } = useSelector((state) => state.query);

  const collectionIds = previewCollections.map((collection) => collection.id);

  const inSelectedMedia = (collectionId) => collectionIds.includes(collectionId);

  if (isLoading) {
    return (<div>Loading...</div>);
  }
  return (
    <div className="container featured-collections-container">
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
          {data.collections.map((collection) => (
            <tr key={collection.id}>
              <td><Link target="_blank" rel="noopener noreferrer" to={`/collections/${collection.id}`}>{collection.name}</Link></td>
              <td>{collection.notes}</td>
              <td>
                {!(inSelectedMedia(collection.id)) && (
                <AddCircleIcon sx={{ color: '#d24527' }} onClick={() => dispatch(addPreviewSelectedMedia(collection))} />
                )}
                {(inSelectedMedia(collection.id)) && (
                <RemoveCircleIcon sx={{ color: '#d24527' }} onClick={() => dispatch(removePreviewSelectedMedia(collection.id))} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
