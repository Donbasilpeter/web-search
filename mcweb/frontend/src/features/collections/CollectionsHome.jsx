import * as React from 'react';

import FeaturedCollections from './FeaturedCollections';

export default function CollectionsHome() {
  return (
    <>
      <div className="feature-area filled">
        <div className="container">
          <div className="row">
            <div className="col-4">
              <h1>Collections</h1>
              <p>
                Check the breadth of our global coverage by browsing the media sources
                and collections in our database, and suggesting more to add.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <FeaturedCollections />
      </div>
    </>
  );
}