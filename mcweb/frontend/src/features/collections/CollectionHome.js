import * as React from 'react';
import { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetFeaturedCollectionsQuery } from '../../app/services/collectionsApi';
import { setCollections } from './collectionsSlice';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#99b9de' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.primary
}));


export default function CollectionHome() {
    const {data} = useGetFeaturedCollectionsQuery();
    const featuredCollections = data;
    if (!featuredCollections){
        return (<></>)
    } else {
    return (
        <div>
            <h1>Featured Collections</h1>
            {console.log(featuredCollections['collections'])}
            {(featuredCollections['collections'].map((collection) => 
                <Grid key={`featured-collection-${collection.id}`} item xs={12} sm={6} md={4} lg={3}>
                    <Link to={`/collections/${collection.id}`}>
                        <Item>{collection.name}</Item>
                    </Link>
                </Grid>     
            ))}
        </div >
    )};
}
