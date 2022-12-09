import PropTypes from 'prop-types';
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyListCollectionsQuery } from '../../app/services/collectionsApi';
import { useLazyListSourcesQuery } from '../../app/services/sourceApi';
import { platformDisplayName, trimStringForDisplay } from '../ui/uiUtil';

const MIN_QUERY_LEN = 2;  // don't query for super short things
const MAX_RESULTS = 10;  // per endpoint
const MIN_POLL_MILLISECS = 500; // throttle requests
const MAX_MATCH_DISPLAY_LEN = 50; // make sure labels are too long

// @see https://mui.com/material-ui/react-autocomplete/#load-on-open
export default function DirectorySearch({searchCollections, searchSources}) {
    const [lastRequestTime, setLastRequestTime] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [collectionOptions, setCollectionOptions] = React.useState([]);
    const [sourceOptions, setSourceOptions] = React.useState([]);
    const [searchStr, setSearchStr] = React.useState('');
    const navigate = useNavigate();
    const [collectionTrigger, {
        isFetching: isCollectonSearchFetching, data: collectionSearchResults,
      }] = useLazyListCollectionsQuery();
    const [sourceTrigger, {
        isFetching: isSourceSearchFetching, data: sourceSearchResults,
    }] = useLazyListSourcesQuery();
    
    // handle collection search results  
    useEffect(() => {
        let active = true;
        if (!isCollectonSearchFetching) {
            return undefined;
        }
        if (active && collectionSearchResults) {
            const existingOptionIds = collectionOptions.filter(o => o.type == 'collection').map(o => o.id);
            const newOptions = collectionSearchResults.results.filter(c => !existingOptionIds.includes(c.id));
            setCollectionOptions(newOptions.slice(0,MAX_RESULTS).map(c => ({
                displayGroup: 'Collections',
                type: 'collection',
                id: c.id,
                value: c.id,
                label: `${trimStringForDisplay(c.name, MAX_MATCH_DISPLAY_LEN)} (${platformDisplayName(c.platform)})`
            })));
        }
        return () => {
            active = false;
        };
    }, [isCollectonSearchFetching]);


    // handle source search results  
    useEffect(() => {
        let active = true;
        if (!isSourceSearchFetching) {
            return undefined;
        }
        if (active && sourceSearchResults) {
            const existingOptionIds = sourceOptions.filter(o => o.type == 'source').map(o => o.id);
            const newOptions = sourceSearchResults.results.filter(s => !existingOptionIds.includes(s.id));
            setSourceOptions(newOptions.slice(0,MAX_RESULTS).map(s => ({
                displayGroup: 'Sources',
                type: 'source',
                id: s.id,
                value: s.id,
                label: `${trimStringForDisplay(s.label || s.name, MAX_MATCH_DISPLAY_LEN)} (${platformDisplayName(s.platform)})`
            })));
        }
        return () => {
            active = false;
        };
    }, [isSourceSearchFetching]);

    const somethingIsFetching = isCollectonSearchFetching || isSourceSearchFetching;

    useEffect(() => {
        if (!open) {
          setSourceOptions([]);
          setCollectionOptions([]);
        }
    }, [open]);

    return (
        <Autocomplete
            id="quick-directory-search"
            open={open}
            filterOptions={(x) => x} /* let the server filter optons */
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.label}
            noOptionsText="No matches"
            groupBy={(option) => option.displayGroup}
            options={[...collectionOptions, ...sourceOptions]}
            loading={somethingIsFetching}
            onChange={(e, value) => {   /** called when an option is clicked */
                if (value.type=="collection") {
                    navigate(`/collections/${value.id}`);
                }
                if (value.type=="source") {
                    navigate(`/sources/${value.id}`);
                }
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search for Collections or Sources"
                    disabled={somethingIsFetching}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                            {somethingIsFetching ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                    onChange={({target: {value}}) => {
                        setSourceOptions([]);
                        setCollectionOptions([]);
                        // only search if str is long enough, and if we haven't searched recently
                        if ((value.length > MIN_QUERY_LEN) && (Date.now() > (lastRequestTime + MIN_POLL_MILLISECS))) {
                            setLastRequestTime(Date.now());
                            sourceTrigger({name: value});
                            collectionTrigger({name: value});
                        }
                    }}
                />
            )}
        />
    );
}


DirectorySearch.propTypes = {
    searchCollections: PropTypes.bool,
    searchSources: PropTypes.bool,
};

DirectorySearch.defaultProps = {
    searchCollections: true,
    searchSources: true,
};
