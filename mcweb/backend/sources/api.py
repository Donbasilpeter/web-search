from http.client import CannotSendHeader, HTTPResponse
from importlib.metadata import metadata
from django.shortcuts import get_object_or_404
from .models import Collection, Feed, Source
from rest_framework import viewsets, permissions
from .serializer import CollectionSerializer, FeedsSerializer, SourcesSerializer, CollectionListSerializer, SourceListSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
import json
import os
from settings import BASE_DIR
from util.cache import cache_by_kwargs
from rest_framework.renderers import JSONRenderer

# csv

import csv
from django.http import HttpResponse
from django.shortcuts import render



class CollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = CollectionSerializer

    @cache_by_kwargs()
    def list(self, request):
        queryset = Collection.objects.all()

        file_path = os.path.join(
            BASE_DIR, 'backend/sources/media-collection.json') 
        json_data = open(file_path)  
        deserial_data = json.load(json_data) 
        collection_return = []
        list_ids = [] 
        for collection in deserial_data['featuredCollections']['entries']:
            for id in collection['tags']:
                list_ids.append(id)
            
        collection_return = Collection.objects.filter(id__in=list_ids)
        print(collection_return)
        print(list_ids)
        serializer = CollectionListSerializer(
            {'collections': collection_return})
        return Response(serializer.data)


class FeedsViewSet(viewsets.ModelViewSet):
    queryset = Feed.objects.all()
    permission_classes = [
        permissions.AllowAny

    ]
    serializer_class = FeedsSerializer


class SourcesViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = SourcesSerializer

    @action(methods=['post'], detail=False)
    def upload_sources(self, request):
        collection = Collection.objects.get(pk=request.data['collection_id'])
        email_title = "Updating collection {}".format(collection.name)
        email_text = ""
        queryset = Source.objects.all()
        for row in request.data['sources']:
            if len(row.keys()) <= 1:
                continue
            if len(row['id']) > 0 and row['id'] != 'null':
                existing_source = queryset.filter(pk=row['id'])
                canonical_domain = existing_source[0].name
            else:
                canonical_domain = urls.canonical_domain(row['homepage'])
                existing_source = queryset.filter(name=canonical_domain)
            if len(existing_source) == 0:
                existing_source = Source.create_new_source(row)
                email_text += "\n {}: created new source".format(
                    canonical_domain)
            elif len(existing_source) > 1:
                existing_source = existing_source[0]
                email_text += "\n {}: updated existing source".format(
                    canonical_domain)
            else:
                existing_source = existing_source[0]
                email_text += "\n {}: updated existing source".format(
                    canonical_domain)
            collection.source_set.add(existing_source)
        #   send_email_summary(current_user.email, email_title, email_text)
        print(email_text)
        return Response({'title': email_title, 'text': email_text})

    @action(detail=False)
    def download_csv(self, request):

        collection_id = request.query_params.get('collection_id')
        collection = Collection.objects.get(id=collection_id)
        source_associations = collection.source_set.all()

        # 'collection-id/timestamp' 
        # 812312321-202209191430.csv
        response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="somefilename.csv"'},
        )

        writer = csv.writer(response)

        # extract into a constat (global)
        writer.writerow(['id', 'name', 'url_search_string', 'label',
        'homepage', 'notes', 'service',  'stories_per_week',
        'first_story', 'publication_country', 'publication_state',
        'primary_langauge', 'media_type'])

        for source in source_associations:
            writer.writerow([source.id, source.name, source.url_search_string, source.label,
                  source.homepage, source.notes, source.service, source.stories_per_week,
                  source.first_story, source.pub_country, source.pub_state, source.primary_language,
                  source.media_type])

        return response


class SourcesCollectionsViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        collection_bool = request.query_params.get('collection')
        if (collection_bool == 'true'):
            collections_queryset = Collection.objects.all()
            collection = get_object_or_404(collections_queryset, pk=pk)
            source_associations = collection.source_set.all()
            serializer = SourceListSerializer({'sources': source_associations})
            return Response(serializer.data)
        else:
            sources_queryset = Source.objects.all()
            source = get_object_or_404(sources_queryset, pk=pk)
            collection_associations = source.collections.all()
            serializer = CollectionListSerializer(
                {'collections': collection_associations})
            return Response(serializer.data)

    def destroy(self, request, pk=None):
        collection_bool = request.query_params.get('collection')
        if (collection_bool == 'true'):
            collections_queryset = Collection.objects.all()
            collection = get_object_or_404(collections_queryset, pk=pk)
            source_id = request.query_params.get('source_id')
            sources_queryset = Source.objects.all()
            source = get_object_or_404(sources_queryset, pk=source_id)
            collection.source_set.remove(source)
            return Response({'collection_id': pk, 'source_id': source_id})
        else:
            sources_queryset = Source.objects.all()
            source = get_object_or_404(sources_queryset, pk=pk)
            collection_id = request.query_params.get('collection_id')
            collections_queryset = Collection.objects.all()
            collection = get_object_or_404(
                collections_queryset, pk=collection_id)
            source.collections.remove(collection)
            return Response({'collection_id': collection_id, 'source_id': pk})

    def create(self, request):
        source_id = request.data['source_id']
        sources_queryset = Source.objects.all()
        source = get_object_or_404(sources_queryset, pk=source_id)
        collection_id = request.data['collection_id']
        collections_queryset = Collection.objects.all()
        collection = get_object_or_404(collections_queryset, pk=collection_id)
        source.collections.add(collection)
        return Response({'source_id': source_id, 'collection_id': collection_id})
