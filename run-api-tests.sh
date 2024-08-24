#!/bin/bash

docker compose -p jaaluh_developer_test_3a -f docker-compose.apitest.yml build &&
docker compose -p jaaluh_developer_test_3a -f docker-compose.apitest.yml run --rm -it jest &&
docker compose -p jaaluh_developer_test_3a -f docker-compose.apitest.yml stop &&
docker compose -p jaaluh_developer_test_3a -f docker-compose.apitest.yml rm -f
