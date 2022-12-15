import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import dayjs from 'dayjs';
import { useUpdateFeedMutation, useGetFeedQuery } from '../../app/services/feedsApi';

function ModifyFeed() {
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const feedId = Number(params.feedId); // get collection id from wildcard

  const { data, isLoading } = useGetFeedQuery(feedId);
  const [updateFeed, updateResults] = useUpdateFeedMutation(feedId);

  // form state for text fields
  const [formState, setFormState] = useState({
    id: 0,
    name: '',
    notes: '',
    url: '',
    admin: true,
    system: true,
    status: 'working',
    attempt: dayjs().format(),
    success: dayjs().format(),
    created: dayjs().format(),
    modified: dayjs().format(),
  });

  const handleChange = ({ target: { name, value } }) => (
    setFormState((prev) => ({ ...prev, [name]: value }))
  );

  const handleCheck = () => (
    setFormState((prev) => ({ ...prev, admin: !prev.admin }))
  );

  useEffect(() => {
    if (data) {
      const formData = {
        id: data.id,
        name: data.name,
        url: data.url,
        admin: data.admin_rss_enabled,
        source: data.source,
        created: dayjs(data.created_at).format(),
        modified: dayjs(data.modified_at).format(),
      };
      setFormState(formData);
    }
  }, [data]);

  if (isLoading) {
    return <CircularProgress size="75px" />;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2>Edit Feed</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <br />
          <TextField
            label="Name"
            fullWidth
            id="text"
            name="name"
            value={formState.name}
            onChange={handleChange}
          />
          <br />
          <br />
          <TextField
            fullWidth
            label="URL"
            id="outlined-multiline-static"
            name="notes"
            value={formState.url}
            onChange={handleChange}
          />
          <br />
          <br />
          <FormControl>
            <FormControlLabel control={<Checkbox onChange={handleCheck} checked={formState.admin} />} label="Admin enabled?" />
          </FormControl>
          <br />
          <br />
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const updatedFeed = await updateFeed({
                  feed: formState,
                });
                enqueueSnackbar('Saved changes', { variant: 'success' });
              } catch (err) {
                console.log(err);
                const errorMsg = `Failed - ${err.data.message}`;
                enqueueSnackbar(errorMsg, { variant: 'error' });
              }
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ModifyFeed;
