import * as React from 'react';
import { TextField, MenuItem, Box, FormControlLabel, Button, Checkbox } from '@mui/material';
import { useState } from 'react';
import { PublishedWithChanges } from '@mui/icons-material';

import {
  useGetSourceQuery,
  useUpdateSourceMutation,
  useDeleteSourceMutation,
  usePostSourceMutation
}
  from '../../app/services/sourceApi';

export default function ModifySource() {

  const handleChange = ({ target: { name, value } }) => setFormState((prev) => ({ ...prev, [name]: value }))

  // menu options
  const services = ["Online News", "Youtube"]



  // form state for text fields 
  const [formState, setFormState] = React.useState({
    id: 577, name: "", notes: "", homepage: "", label: "", serivce: ""
  });

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetSourceQuery(formState.id)

  // create 
  const [post, { setPost }] = usePostSourceMutation();

  // update 
  const [update, { setUpdate }] = useUpdateSourceMutation();

  // delete 
  const [remove, { setRemove }] = useDeleteSourceMutation();



  return (
    <div className='container'>
      <div className="collection-header">
        <h2 className="title">Modify this Source</h2>

        <ul>
          <TextField
            id="text"
            label="ID"
            name="id"
            defaultValue={formState.id}
            onChange={handleChange}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              setFormState({
                id: data.id, 
                name: data.name,
                notes: data.id,
                homepage: data.name, 
                label: data.service,
              })
            }}
          >
            Get
          </Button>

          {/* Name */}
          <li>
            <h5>Name</h5>
            <TextField
              fullWidth
              id="text"
              name="name"
              value={formState.name}
              onChange={handleChange}
            />
          </li>

          {/* Notes */}
          <li>
            <h5>Notes</h5>
            <TextField
              fullWidth
              id="outlined-multiline-static"
              name="notes"
              multiline
              rows={4}
              value={formState.notes}
              onChange={handleChange}
            />
          </li>

          {/* Homepage */}
          <li>
            <h5>Homepage</h5>
            <TextField
              fullWidth
              id="text"
              name="homepage"
              value={formState.homepage}
              onChange={handleChange}
            />
          </li>

          {/* Label */}
          <li>
            <h5>Label</h5>
            <TextField
              fullWidth
              id="text"
              name="label"
              value={formState.label}
              onChange={handleChange}
            />
          </li>

          {/* Service */}
          <li>
            <h5>Service</h5>
            <TextField
              fullWidth
              id="text"
              name="service"
              value={formState.name}
              onChange={handleChange}
            />
          </li>


          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              const updateCollection = await update({
                ...formState
              }).unwrap();
              console.log(updateCollection)
            }}
          >
            Update
          </Button>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              console.log(formState.id)
              const deleteCollection = await remove({
                id: formState.id
              }).unwrap()
              console.log(deleteCollection)
            }}
          >
            Delete
          </Button>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              const createCollection = await post({
                name: formState.name,
                notes: formState.notes
              }).unwrap()
              // null == deleted 
              console.log(createCollection)
            }}
          >
            Create
          </Button>
        </ul>
      </div>
    </div >
  );
}